export async function clean() {
    await folder('target').delete()
}

export async function format() {
    await shell('prettier --no-semi --single-quote --print-width 240 --trailing-comma all --write libs')
}

export async function start() {
    await shell('hammer serve example/index.html --dist target/example')
}

