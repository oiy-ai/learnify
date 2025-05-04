#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
  napi_build::setup();
  Ok(())
}
