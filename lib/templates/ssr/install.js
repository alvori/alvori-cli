const exec = require('child_process').execSync

const gitUser = () => {
    let name
    let email
  
    try {
      name = exec('git config --get user.name')
      email = exec('git config --get user.email')
    }
    catch (e) {}
  
    name = name && JSON.stringify(name.toString().trim()).slice(1, -1)
    email = email && (' <' + email.toString().trim() + '>')
  
    return (name || '') + (email || '')
}

exports.questions = [
    {
        type: 'input',
        name: 'name',
        message: 'Project name',
        default: 'app',
        validate: val => val && val.length > 0
    },
    {
        type: 'input',
        name: 'productName',
        message: 'Project product name',
        default: 'Alvori App'
    },
    {
        type: 'input',
        name: 'description',
        message: 'Project description',
        default: 'Alvori Freamwork App'
    },
    {
        type: 'input',
        name: 'author',
        message: 'Author',
        default: gitUser()
    },
    {
        type: 'input',
        name: 'license',
        message: 'License',
        default: 'MIT'
    },
    {
        type: 'confirm',
        name: 'installDependencies',
        message: 'Continue to install project dependencies after the project has been created? (recommended) (Use arrow keys)',
        default: true
    },
];

exports.pkgJSON = [
    'name',
    'productName',
    'description',
    'author',
    'license',
]

exports.installPackages = true

exports.install = async ({name, srcDir, projectDir, answers, ora, copy}) => {
    return new Promise((resolve) => {
        const spinner = ora('Installing a template')
        spinner.start()
        copy(srcDir, projectDir).then(() => {
            spinner.stop()
            resolve()
        })
    })
}

exports.onBeforeInstallDependencies = () => {
    console.log('Installing project dependencies ...')
}

exports.complete = async ({name, projectDir, answers, colors, installed}) => {
    const message = `
    ${colors.green('Alvori Project initialization finished!')}

    To get started:

    ${colors.yellow(installed ? `cd ${name}\n` : `npm install (or if using yarn: yarn)\n`)}
    Run project in development mode: ${colors.yellow(`alvori dev`)}

    Please give us a star on Github if you appreciate our work:
    https://github.com/sander111/alvori-app

    Enjoy! - Alvori Team
    `
    console.log(message)
}