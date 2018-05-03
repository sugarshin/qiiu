import {Command, flags} from '@oclif/command'

import {upload} from './upload'

class Qiiu extends Command {
  static description = 'Upload image to Qiita'

  static flags = {
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),
    username: flags.string({char: 'u', description: 'Qiita username', required: true}),
    password: flags.string({char: 'p', description: 'Qiita password', required: true}),
    backupcode: flags.string({
      char: 'c',
      description: 'Qiita backup code. this required if you 2 factor authentication enabled',
    }),
    verbose: flags.boolean({description: 'output verbose messages on internal operations'})
  }

  static args = [{name: 'imagePath'}]

  async run() {
    const {args, flags} = this.parse(Qiiu)
    const imageUrl: string = await upload(args.imagePath, {
      username: flags.username,
      password: flags.password,
      backupcode: flags.backupcode,
      verbose: flags.verbose,
    })
    this.log(imageUrl)
  }
}

export = Qiiu
