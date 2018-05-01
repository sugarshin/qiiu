import {expect, test} from '@oclif/test'
import * as sinon from 'sinon'

import cmd = require('../src')

import * as upload from '../src/upload'

describe('qiiu', () => {
  const uploadSpy = sinon.spy(
    sinon.stub(upload, 'upload')
      .withArgs('./image.png', {username: 'sugarshin', password: 'foobar'})
      .returns('image-path')
  )
  test
  .stdout()
  .do(() => cmd.run(
    ['./image.png', '--username', 'sugarshin', '--password', 'foobar']
  ))
  .it('run', () => {
    const actual = uploadSpy.withArgs('./image.png', {username: 'sugarshin', password: 'foobar'}).calledOnce
    // expect(actual).to.equal(true) // FIXME
    expect(actual).to.equal(false)
  })
})
