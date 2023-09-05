@group(0) @binding(0) var<uniform> frame : u32;

@fragment
fn main() -> @location(0) vec4<f32> {
  return vec4(sin(f32(frame)), 0.0, 0.0, 1.0);
}
