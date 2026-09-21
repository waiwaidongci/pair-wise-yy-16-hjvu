import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";

interface FormValues {
  name: string;
  email: string;
  message: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

type Status = "idle" | "submitting" | "success";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EMPTY_VALUES: FormValues = { name: "", email: "", message: "" };

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) {
    errors.name = "Please enter your name.";
  }
  if (!values.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Invalid email format, e.g. name@example.com.";
  }
  if (!values.message.trim()) {
    errors.message = "Please write a message.";
  } else if (values.message.trim().length < 10) {
    errors.message = "The message needs at least 10 characters.";
  }
  return errors;
}

export function ContactPage() {
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormValues, boolean>>({
    name: false,
    email: false,
    message: false,
  });
  const [status, setStatus] = useState<Status>("idle");

  const isValid = useMemo(
    () => Object.keys(validate(values)).length === 0,
    [values],
  );

  const handleChange =
    (field: keyof FormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextValues = { ...values, [field]: event.target.value };
      setValues(nextValues);
      // 实时更新行内错误，但只在该字段被触碰后展示
      if (touched[field]) {
        setErrors(validate(nextValues));
      }
    };

  const handleBlur = (field: keyof FormValues) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(values));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(nextErrors).length > 0) return;

    // 前端模拟提交：无后端
    setStatus("submitting");
    window.setTimeout(() => {
      setStatus("success");
    }, 900);
  };

  const handleReset = () => {
    setValues(EMPTY_VALUES);
    setErrors({});
    setTouched({ name: false, email: false, message: false });
    setStatus("idle");
  };

  const visibleError = (field: keyof FormValues) =>
    touched[field] ? errors[field] : undefined;

  return (
    <div className="container contact-page">
      <header className="contact-page__header">
        <h1 className="page-title">Contact</h1>
        <p className="page-subtitle">
          For commissions, exhibitions, and print sales, please leave a
          message. Replies usually go out within a week.
        </p>
      </header>

      {status === "success" ? (
        <div className="contact-success" role="status">
          <div className="contact-success__icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="34" height="34">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="contact-success__title">Message sent</h2>
          <p className="contact-success__text">
            Thank you, {values.name.trim()}. Your message has been received —
            I will get back to you at {values.email.trim()}.
          </p>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={handleReset}
          >
            Write another message
          </button>
        </div>
      ) : (
        <form className="contact-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label htmlFor="contact-name" className="form-field__label">
              Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              className={`form-field__input${
                visibleError("name") ? " form-field__input--invalid" : ""
              }`}
              value={values.name}
              onChange={handleChange("name")}
              onBlur={handleBlur("name")}
              aria-invalid={Boolean(visibleError("name"))}
              aria-describedby="contact-name-error"
              autoComplete="name"
            />
            {visibleError("name") && (
              <p id="contact-name-error" className="form-field__error">
                {visibleError("name")}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="contact-email" className="form-field__label">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              className={`form-field__input${
                visibleError("email") ? " form-field__input--invalid" : ""
              }`}
              value={values.email}
              onChange={handleChange("email")}
              onBlur={handleBlur("email")}
              aria-invalid={Boolean(visibleError("email"))}
              aria-describedby="contact-email-error"
              autoComplete="email"
              placeholder="name@example.com"
            />
            {visibleError("email") && (
              <p id="contact-email-error" className="form-field__error">
                {visibleError("email")}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="contact-message" className="form-field__label">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              rows={6}
              className={`form-field__input form-field__input--textarea${
                visibleError("message") ? " form-field__input--invalid" : ""
              }`}
              value={values.message}
              onChange={handleChange("message")}
              onBlur={handleBlur("message")}
              aria-invalid={Boolean(visibleError("message"))}
              aria-describedby="contact-message-error"
            />
            {visibleError("message") && (
              <p id="contact-message-error" className="form-field__error">
                {visibleError("message")}
              </p>
            )}
          </div>

          <div className="contact-form__actions">
            <button
              type="submit"
              className="btn btn--gold"
              disabled={!isValid || status === "submitting"}
            >
              {status === "submitting" ? "Sending…" : "Send message"}
            </button>
            {!isValid && (
              <p className="contact-form__hint">
                Please fix the errors in the form first.
              </p>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
