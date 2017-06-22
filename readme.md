# neuron-gpgpu

A GPGPU implementation of a multi layer perceptron network targetting webgl 2.0.

### overview

This project is a small experiment to test processing forward and back propagation algorithms on a GPU via WebGL 2. 

### example

```javascript
//------------------------------------------------------
//  network topology
//
//    0 0     <--- input layer
//  / /|\ \
// 0 0 0 0 0  <--- hidden layer 0
//  \ \|/ /        
//   0 0 0    <--- hidden layer 1
//    \|/
//     0      <--- output layer
//
//------------------------------------------------------
const context = new gpu.Context()
const network = new net.Network(context, [
  new net.Tensor(2),
  new net.Tensor(5),
  new net.Tensor(3),
  new net.Tensor(1)
])

// XOR training data.
setInterval(() => {

  network.backward([0, 0], [0])  
  network.backward([0, 1], [1])  
  network.backward([1, 0], [1])  
  network.backward([1, 1], [0])

  console.log(0, network.forward([0, 0]))
  console.log(1, network.forward([0, 1]))
  console.log(1, network.forward([1, 0]))
  console.log(0, network.forward([1, 1]))

}, 1)

```
