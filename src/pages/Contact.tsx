import { useMemo, useState, type ChangeEvent } from "react";

interface FormValues {
  name: string;
  email: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;
type Touched = Record<keyof FormValues, boolean>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY: FormValues = { name: "", email: "", message: "" };

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = "请填写你的姓名。";
  if (!values.email.trim()) errors.email = "请填写邮箱地址。";
  else if (!EMAIL_RE.test(values.email.trim()))
    errors.email = "邮箱格式不正确，例如 name@example.com。";
  if (!values.message.trim()) errors.message = "请填写留言内容。";
  else if (values.message.trim().length < 10)
    errors.message = "留言至少需要 10 个字符，让我多了解一些。";
  return errors;
}

export default function Contact() {
  const [values, setValues] = useState<FormValues>(EMPTY);
  const [touched, setTouched] = useState<Touched>({
    name: false,
    email: false,
    message: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validate(values), [values]);
  const isValid = Object.keys(errors).length === 0;

  const handleChange =
    (field: keyof FormValues) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
    };

  const handleBlur = (field: keyof FormValues) => () => {
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || submitting) return;
    setSubmitting(true);
    // 无后端：前端模拟网络提交
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSubmitting(false);
    setSubmitted(true);
  };

  const resetForm = () => {
    setValues(EMPTY);
    setTouched({ name: false, email: false, message: false });
    setSubmitted(false);
  };

  const errorFor = (field: keyof FormValues) =>
    touched[field] || submitting ? errors[field] : undefined;

  return (
    <div className="page page--contact">
      <div className="contact__layout">
        <div className="contact__intro">
          <h1 className="page__title">联系</h1>
          <p className="page__lede">
            无论是拍摄委托、作品收藏，还是关于照片的任何问题，
            都可以通过下面的表单留言，我会在一周内回复。
          </p>
        </div>

        <div className="contact__panel">
          {submitted ? (
            <div className="form-success" role="status">
              <span className="form-success__icon" aria-hidden>
                ✓
              </span>
              <h2 className="form-success__title">留言已发送</h2>
              <p className="form-success__text">
                谢谢你，{values.name.trim()}。
                我已收到关于「{values.message.trim().slice(0, 24)}
                {values.message.trim().length > 24 ? "…" : ""}」的留言，
                稍后会通过 {values.email.trim()} 与你联系。
              </p>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={resetForm}
              >
                再写一条留言
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div
                className={`field${errorFor("name") ? " field--invalid" : ""}`}
              >
                <label htmlFor="name">姓名</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={values.name}
                  onChange={handleChange("name")}
                  onBlur={handleBlur("name")}
                  aria-invalid={Boolean(errorFor("name"))}
                  aria-describedby={errorFor("name") ? "name-error" : undefined}
                  placeholder="你的称呼"
                />
                {errorFor("name") && (
                  <p className="field__error" id="name-error">
                    {errorFor("name")}
                  </p>
                )}
              </div>

              <div
                className={`field${errorFor("email") ? " field--invalid" : ""}`}
              >
                <label htmlFor="email">邮箱</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={handleChange("email")}
                  onBlur={handleBlur("email")}
                  aria-invalid={Boolean(errorFor("email"))}
                  aria-describedby={
                    errorFor("email") ? "email-error" : undefined
                  }
                  placeholder="name@example.com"
                />
                {errorFor("email") && (
                  <p className="field__error" id="email-error">
                    {errorFor("email")}
                  </p>
                )}
              </div>

              <div
                className={`field${errorFor("message") ? " field--invalid" : ""}`}
              >
                <label htmlFor="message">留言</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={values.message}
                  onChange={handleChange("message")}
                  onBlur={handleBlur("message")}
                  aria-invalid={Boolean(errorFor("message"))}
                  aria-describedby={
                    errorFor("message") ? "message-error" : undefined
                  }
                  placeholder="想聊聊的拍摄计划或合作方式……"
                />
                {errorFor("message") && (
                  <p className="field__error" id="message-error">
                    {errorFor("message")}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn--gold"
                disabled={!isValid || submitting}
              >
                {submitting ? "发送中…" : "发送留言"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
