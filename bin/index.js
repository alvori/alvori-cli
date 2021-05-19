#!/usr/bin/env node

const program = require('commander')
const inquirer = require('inquirer')
const colors = require('colors')
const { spawn } = require('child_process')
const fs = require('fs')
const fse = require('fs-extra')
const rimraf = require('rimraf')
const path = require('path')
const ora = require('ora')
const gitDownload = require('download-git-repo')

const version = `Alvori CLI version: ${JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'))).version}`
const commands = ['create', '-V', '--version', '-h', '--help']
const cmd = process.argv[2]

const createProjectDir = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir)
    }
}

const copy = (src, dest) => {
    return new Promise((resolve, reject) => {
        fse.copy(src, dest, function (err) {
            if (err) {
                console.log(err)
                reject()
            } else {
                fs.unlinkSync(path.join(dest, 'install.js'))
                resolve()
            }
        })
    })
}

const create = (name, args) => {
    const projectDir = `${process.cwd()}/${name}/`
    loadStarterTpl(args.template, projectDir).then((tpl) => {
        const installer = tpl.installer
        const srcDir = tpl.src
        const questions = installer.questions

        inquirer.prompt(questions).then((answers) => {
            createProjectDir(projectDir)
            installer
                .install({ name, srcDir, projectDir, answers, colors, ora, copy })
                .then(() => {
                    return preparePackageJSON(installer.pkgJSON, { projectDir, answers, allowed: installer.pkgJSON })
                })
                .then(() => {
                    return installDependencies(answers.installDependencies, projectDir, installer)
                })
                .then((installed) => {
                    rimraf(path.join(__dirname, '../lib/templates/tmp/'), () => {})
                    return installer.complete({ name, projectDir, answers, colors, installed })
                })
        })
    })
}

const loadStarterTpl = (tpl) => {
    if (tpl) {
        return tpl[0] === '.' ? loadInstaller(tpl) : downloadTpl(tpl)
    } else {
        return loadDefaultTpl()
    }
}

const downloadTpl = (url) => {
    return new Promise((resolve, reject) => {
        const spinner = ora('Download template')
        spinner.start()
        gitDownload(url, path.join(__dirname, '../lib/templates/tmp/'), (err) => {
            if (err) {
                spinner.stop()
                console.log(err)
                reject()
            } else {
                spinner.stop()
                resolve({
                    installer: require(path.join(__dirname, '../lib/templates/tmp/install')),
                    src: path.join(__dirname, '../lib/templates/tmp/'),
                })
            }
        })
    })
}

const loadInstaller = (tpl) =>
    new Promise((resolve) => {
        resolve({
            installer: require(path.join(process.cwd(), tpl, 'install')),
            src: path.join(process.cwd(), tpl),
        })
    })

const loadDefaultTpl = () =>
    new Promise((resolve) => {
        resolve({
            installer: require(path.join(__dirname, '../lib/templates/ssr/install')),
            src: path.join(__dirname, '../lib/templates/ssr/'),
        })
    })

const preparePackageJSON = (bool, { projectDir, answers, allowed }) => {
    return new Promise((resolve, reject) => {
        if (bool) {
            let file = `${projectDir}package.json`
            if (fs.existsSync(file)) {
                let package = JSON.parse(fs.readFileSync(file))
                for (let k in answers) {
                    if (allowed.includes(k)) {
                        package[k] = answers[k]
                    }
                }
                fs.writeFileSync(file, JSON.stringify(package, null, 4), 'UTF-8', (err) => err && console.log(err))
                resolve()
            } else {
                console.log(colors.red(`File preparation error: The package.json file does not exist`))
                reject()
            }
        } else {
            resolve()
        }
    })
}

const installDependencies = (bool, dir, installer) => {
    return new Promise((resolve, reject) => {
        if (bool) {
            try {
                if (!fs.existsSync(`${dir}package.json`)) {
                    console.log(colors.red(`File preparation error: The package.json file does not exist`))
                    reject()
                }
                installer.onBeforeInstallDependencies()
                const run = spawn('npm', ['install'], { cwd: dir, stdio: 'inherit', shell: true })
                run.on('error', (error) => {
                    console.error(`error: ${error.message}`)
                    reject(false)
                })

                run.on('close', (code) => {
                    resolve(true)
                })
            } catch (err) {
                console.log('chdir: ' + err)
                reject()
            }
        } else {
            resolve()
        }
    })
}

// Create new project
// $ alvori create

if (commands.includes(cmd)) {
    program
        .command('create <name>')
        .description('Create new project')
        .option('-t, --template [value]', 'Use specific starter template')
        .action(function (name, args) {
            console.log(fs.readFileSync(path.join(__dirname, '../assets/logo.art'), 'utf8'))
            create(name, args)
        })

    program.option('-h, --help', 'Show app version').action((args) =>
        console.log(`
    Init project
        $ alvori create <name> [options] - Create new project
    Options
        -t, --template [value] - Use specific starter template. If no value is specified, the default start template is used
        `)
    )

    program.version(version)

    program.parse(process.argv)
}

fs.existsSync(path.join(process.cwd(), 'app/bin/index.js')) && require(path.join(process.cwd(), 'app/bin/index.js'))
