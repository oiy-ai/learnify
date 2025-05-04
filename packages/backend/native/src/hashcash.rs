use std::convert::TryFrom;

use affine_common::hashcash::Stamp;
use napi::{bindgen_prelude::AsyncTask, Env, JsBoolean, JsString, Result as NapiResult, Task};
use napi_derive::napi;

pub struct AsyncVerifyChallengeResponse {
  response: String,
  bits: u32,
  resource: String,
}

#[napi]
impl Task for AsyncVerifyChallengeResponse {
  type Output = bool;
  type JsValue = JsBoolean;

  fn compute(&mut self) -> NapiResult<Self::Output> {
    Ok(if let Ok(stamp) = Stamp::try_from(self.response.as_str()) {
      stamp.check(self.bits, &self.resource)
    } else {
      false
    })
  }

  fn resolve(&mut self, env: Env, output: bool) -> NapiResult<Self::JsValue> {
    env.get_boolean(output)
  }
}

#[napi]
pub fn verify_challenge_response(
  response: String,
  bits: u32,
  resource: String,
) -> AsyncTask<AsyncVerifyChallengeResponse> {
  AsyncTask::new(AsyncVerifyChallengeResponse {
    response,
    bits,
    resource,
  })
}

pub struct AsyncMintChallengeResponse {
  bits: Option<u32>,
  resource: String,
}

#[napi]
impl Task for AsyncMintChallengeResponse {
  type Output = String;
  type JsValue = JsString;

  fn compute(&mut self) -> NapiResult<Self::Output> {
    Ok(Stamp::mint(self.resource.clone(), self.bits).format())
  }

  fn resolve(&mut self, env: Env, output: String) -> NapiResult<Self::JsValue> {
    env.create_string(&output)
  }
}

#[napi]
pub fn mint_challenge_response(
  resource: String,
  bits: Option<u32>,
) -> AsyncTask<AsyncMintChallengeResponse> {
  AsyncTask::new(AsyncMintChallengeResponse { bits, resource })
}
