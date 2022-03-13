import { net, gpu } from "@sinclair/neuron"

const context = gpu.Context.create()
const network = new net.Network(context, [
  new net.Tensor(2),
  new net.Tensor(5),
  new net.Tensor(3),
  new net.Tensor(1)
])

window.addEventListener("load", () => {
  let element = document.getElementById("output") as HTMLPreElement
  let iteration = 0
  const step = () => {
    window.requestAnimationFrame(() => {
      
      network.backward([0, 0], [0])
      network.backward([0, 1], [1])
      network.backward([1, 0], [1])
      network.backward([1, 1], [0])

      const output = `
        iteration: ${iteration}
        [0, 0] ${network.forward([0, 0])}
        [0, 1] ${network.forward([0, 1])}
        [1, 0] ${network.forward([1, 0])}
        [1, 1] ${network.forward([1, 1])}
      `
      element.innerHTML = output
      iteration += 1
      step()
    })
  }
  step()
})
