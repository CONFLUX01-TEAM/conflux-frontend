#!/usr/bin/env node
/**
 * Branch policy: feature/* → dev → main → staging → prod
 *
 * Usage:
 *   node .github/branch-guard.mjs commit
 *   node .github/branch-guard.mjs push
 *   node .github/branch-guard.mjs pr <base> <head> <github_actor>   # CI only
 *
 * Maintainers in .github/branch-bypass-allowlist.json may bypass all rules.
 * Emergency: SKIP_BRANCH_GUARD=1
 */

import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ALLOWLIST_PATH = join(__dirname, 'branch-bypass-allowlist.json')

const PROTECTED_BRANCHES = ['dev', 'main', 'staging', 'prod']

const PROMOTION_TO = {
  main: 'dev',
  staging: 'main',
  prod: 'staging',
}

const BRANCHES_BLOCKED_FROM_DEV = ['main', 'staging', 'prod']

function loadAllowlist() {
  try {
    return JSON.parse(readFileSync(ALLOWLIST_PATH, 'utf8'))
  } catch {
    return { githubUsers: [], gitEmails: [], gitNames: [] }
  }
}

function getGitIdentity() {
  let email = ''
  let name = ''
  try {
    email = execSync('git config user.email', { encoding: 'utf8' }).trim().toLowerCase()
    name = execSync('git config user.name', { encoding: 'utf8' }).trim().toLowerCase()
  } catch {
    /* ignore */
  }
  return { email, name }
}

function isLocalMaintainer(allowlist) {
  const { email, name } = getGitIdentity()
  const emails = (allowlist.gitEmails || []).map((e) => e.toLowerCase())
  const names = (allowlist.gitNames || []).map((n) => n.toLowerCase())
  return emails.includes(email) || names.includes(name)
}

function isGithubMaintainer(allowlist, actor) {
  return (allowlist.githubUsers || []).includes(actor)
}

function fail(message) {
  console.error(`\n❌ Branch policy: ${message}\n`)
  process.exit(1)
}

function isSkipped() {
  return process.env.SKIP_BRANCH_GUARD === '1'
}

function getCurrentBranch() {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', {
      encoding: 'utf8',
    }).trim()
    return branch === 'HEAD' ? '' : branch
  } catch {
    return ''
  }
}

function shortRef(ref) {
  if (!ref) return ''
  return ref.replace(/^refs\/heads\//, '')
}

function validatePromotion(base, head) {
  switch (base) {
    case 'dev':
      if (BRANCHES_BLOCKED_FROM_DEV.includes(head)) {
        fail(`PRs to dev must come from a feature branch, not "${head}".`)
      }
      break
    case 'main':
      if (head !== 'dev') {
        fail(`PRs to main must come from dev (got "${head}").`)
      }
      break
    case 'staging':
      if (head !== 'main') {
        fail(`PRs to staging must come from main (got "${head}").`)
      }
      break
    case 'prod':
      if (head !== 'staging') {
        fail(`PRs to prod must come from staging (got "${head}").`)
      }
      break
    default:
      break
  }
}

function guardPreCommit(allowlist) {
  if (isLocalMaintainer(allowlist)) {
    console.log('ℹ️  Branch policy bypassed (maintainer allowlist).')
    return
  }

  const branch = getCurrentBranch()
  if (!branch) return

  if (PROTECTED_BRANCHES.includes(branch)) {
    fail(
      `Commits on "${branch}" are not allowed.\n\n` +
        'Create a feature branch and open a PR:\n' +
        '  git checkout -b feat/your-change\n\n' +
        'Promotion flow: feature/* → dev → main → staging → prod',
    )
  }
}

async function readPushLines() {
  const lines = []
  const rl = createInterface({ input: process.stdin })
  for await (const line of rl) {
    const trimmed = line.trim()
    if (trimmed) lines.push(trimmed.split(/\s+/))
  }
  return lines
}

function guardPushRef(localRef, remoteRef, currentBranch, allowlist) {
  if (isLocalMaintainer(allowlist)) return

  if (!remoteRef?.startsWith('refs/heads/')) return

  const target = shortRef(remoteRef)
  const source = shortRef(localRef) || currentBranch

  if (!PROTECTED_BRANCHES.includes(target)) return

  if (target === 'dev') {
    if (BRANCHES_BLOCKED_FROM_DEV.includes(source)) {
      fail(
        `Push to "dev" is not allowed from "${source}".\n\n` +
          'Open a PR from a feature branch into dev instead.',
      )
    }
    return
  }

  const requiredSource = PROMOTION_TO[target]
  if (source !== requiredSource) {
    fail(
      `Push to "${target}" is only allowed from "${requiredSource}" (you are pushing from "${source}").\n\n` +
        'Promotion flow: feature/* → dev → main → staging → prod',
    )
  }
}

async function guardPrePush(allowlist) {
  if (isLocalMaintainer(allowlist)) {
    console.log('ℹ️  Branch policy bypassed (maintainer allowlist).')
    return
  }

  const lines = await readPushLines()
  const currentBranch = getCurrentBranch()

  if (lines.length === 0) {
    if (currentBranch && PROTECTED_BRANCHES.includes(currentBranch)) {
      fail(
        `Push from protected branch "${currentBranch}" is restricted.\n\n` +
          'Use the promotion flow and push from the correct source branch.',
      )
    }
    return
  }

  for (const parts of lines) {
    const [localRef, , remoteRef] = parts
    guardPushRef(localRef, remoteRef, currentBranch, allowlist)
  }
}

function guardPullRequest(allowlist, base, head, actor) {
  if (isGithubMaintainer(allowlist, actor)) {
    console.log(`ℹ️  Branch policy bypassed for maintainer @${actor}.`)
    return
  }

  console.log(`PR: ${head} → ${base} (by @${actor})`)
  validatePromotion(base, head)
  console.log('Branch promotion flow OK.')
}

async function main() {
  if (isSkipped()) {
    console.warn('⚠️  SKIP_BRANCH_GUARD=1 — branch policy checks skipped')
    return
  }

  const allowlist = loadAllowlist()
  const mode = process.argv[2]

  if (mode === 'commit') {
    guardPreCommit(allowlist)
    return
  }

  if (mode === 'push') {
    await guardPrePush(allowlist)
    return
  }

  if (mode === 'pr') {
    const base = process.argv[3]
    const head = process.argv[4]
    const actor = process.argv[5]
    if (!base || !head || !actor) {
      fail('Usage: node .github/branch-guard.mjs pr <base> <head> <github_actor>')
    }
    guardPullRequest(allowlist, base, head, actor)
    return
  }

  fail(`Unknown mode "${mode}". Use "commit", "push", or "pr".`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
