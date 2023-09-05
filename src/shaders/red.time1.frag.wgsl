@group(0) @binding(0) var<uniform> frame : u32;

const pi = 3.14159;

@fragment
fn main(@builtin(position) position : vec4f) -> @location(0) vec4<f32> {
  let time = f32(frame) / 1000.0 * 2.0 * pi;
  return vec4(sin(time), sin(position[0]+time), cos(position[1]), 1.0);
}