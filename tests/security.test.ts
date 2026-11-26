import assert from 'node:assert/strict'
import { test } from 'node:test'
import { contentUrl } from '../src/lib/contentUrl.ts'

test('portfolio links allow web URLs, local assets, and email only where expected', () => {
  assert.equal(contentUrl('/cv.pdf'), '/cv.pdf')
  assert.equal(contentUrl(' https://example.org/demo '), 'https://example.org/demo')
  assert.equal(contentUrl('mailto:hello@example.org', true), 'mailto:hello@example.org')
  assert.equal(contentUrl('mailto:hello@example.org'), null)
  for (const value of [null, {}, '', 'data:text/plain,test', 'javascript:', 'file:/cv.pdf',
    '//example.org', '/\\example.org', 'https://name@example.org', 'ht\ntps://example.org']) {
    assert.equal(contentUrl(value), null)
  }
})
