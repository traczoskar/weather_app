import { all } from "redux-saga/effects";
import { apiDataSaga } from "./apiDataSaga";
import { aiCompletionSaga } from "./aiCompletionSaga";

export default function* rootSaga() {
  yield all([apiDataSaga(), aiCompletionSaga()]);
}
