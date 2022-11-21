import { makeAutoObservable } from "mobx";

export class GlobalStore {
  public loading = false;
  public questionnaireLoading = false;
  public submitionLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  public enableLoader() {
    this.loading = true;
  }

  public disableLoader() {
    this.loading = false;
  }

  public enableQuestionnaireLoader() {
    this.questionnaireLoading = true;
  }

  public disableQuestionnaireLoader() {
    this.questionnaireLoading = false;
  }

  public enableSubmitionLoader() {
    this.submitionLoading = true;
  }

  public disableSubmitionLoader() {
    this.submitionLoading = false;
  }
}

export default GlobalStore;
