'use client';

import { useEffect, useId, useRef, useState } from 'react';

import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useDragControls,
  useReducedMotion,
} from 'framer-motion';
import {
  ArrowRight,
  Check,
  Info,
  Lock,
  Mail,
  Phone,
  User,
  X,
} from 'lucide-react';

import { getLenis } from '@/hooks';

import styles from './modal.module.css';
import { submitLead } from './submit-lead';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
const SHEET_QUERY = '(max-width: 639px)';
const COARSE_QUERY = '(pointer: coarse)';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** the iOS sheet curve, and a springy pop for the desktop card */
const IOS_EASE = [0.32, 0.72, 0, 1];
const SPRING = { type: 'spring', damping: 30, stiffness: 340, mass: 0.9 };

/** little sparkles that burst out of the success badge (blues + the success green) */
const BURST = Array.from({ length: 8 }, (_, index) => {
  const angle = (index / 8) * Math.PI * 2;
  return {
    x: Math.cos(angle) * 58,
    y: Math.sin(angle) * 58,
    color: ['#4359e8', '#9aa8ff', '#1f9d55', '#c9d1ff'][index % 4],
  };
});

function validate({ name, phone, email }) {
  const errors = {};
  const digits = phone.replace(/\D/g, '');
  if (name.trim().length < 2) {
    errors.name = 'Please tell us what to call you.';
  }
  if (phone.trim() && (digits.length < 7 || digits.length > 15)) {
    errors.phone = 'That number looks a little off. Mind double-checking?';
  }
  if (email.trim() && !EMAIL_RE.test(email.trim())) {
    errors.email = 'That email doesn’t look quite right yet.';
  }
  if (!phone.trim() && !email.trim()) {
    errors.contact = 'Add a phone number or an email so we can reach you.';
  }
  return errors;
}

/**
 * One field: its own rounded box with a quiet inline icon and a floating
 * label. The label rests inside the box like a placeholder and glides up to
 * the top edge on focus or once there is a value. The example placeholder only
 * appears while focused, so an empty field stays calm. A small blue tick shows
 * once the value is good.
 */
function Field({ id, icon: Icon, label, error, valid, inputRef, ...inputProps }) {
  return (
    <div className={styles.item}>
      <div
        className={styles.field}
        data-invalid={error ? 'true' : undefined}
        data-valid={valid ? 'true' : undefined}
      >
        <span className={styles.icon} aria-hidden='true'>
          <Icon size={19} strokeWidth={2} />
        </span>
        {/* the input comes first so the label can react to :focus / :placeholder-shown */}
        <input
          id={id}
          ref={inputRef}
          className={styles.input}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...inputProps}
        />
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        <span className={styles.tick} aria-hidden='true'>
          <Check size={13} strokeWidth={3.5} />
        </span>
      </div>
      {error ? (
        <p id={`${id}-error`} className={styles.error} role='alert'>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SuccessView({ firstName, reachAt, formHeight, onDone, doneRef }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key='done'
      className={styles.done}
      style={formHeight ? { minHeight: formHeight } : undefined}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: IOS_EASE }}
    >
      <div className={styles.badgeWrap} aria-hidden='true'>
        {reduceMotion ? null : (
          <>
            <motion.span
              className={styles.ring}
              initial={{ scale: 0.6, opacity: 0.9 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
            />
            {BURST.map(({ x, y, color }) => (
              <motion.span
                key={`${x}${y}`}
                className={styles.spark}
                style={{ backgroundColor: color }}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{ x, y, scale: [0, 1, 0], opacity: [1, 1, 0] }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.25 }}
              />
            ))}
          </>
        )}
        <motion.span
          className={styles.badge}
          initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 240, delay: 0.1 }}
        >
          <svg width='34' height='34' viewBox='0 0 24 24' fill='none'>
            <motion.path
              d='M5 12.5l4.5 4.5L19 7.5'
              stroke='#fff'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut', delay: 0.35 }}
            />
          </svg>
        </motion.span>
      </div>

      <h2 className={styles.doneTitle}>You’re all set, {firstName}.</h2>
      <p className={styles.doneText}>
        Thank you for reaching out. Someone from our team will get in touch with
        you very soon.
      </p>
      <p className={styles.reach}>
        <Check size={15} strokeWidth={2.75} aria-hidden='true' />
        <span>We’ll reach you at {reachAt}</span>
      </p>

      <button
        ref={doneRef}
        type='button'
        className={`${styles.cta} ${styles.ctaDone}`}
        onClick={onDone}
      >
        <span className={styles.ctaLabel}>Done</span>
      </button>
    </motion.div>
  );
}

/**
 * The "Let's talk" popup, opened by the hero and footer CTAs.
 *
 * - Desktop: a centred card that springs in. Phones: a bottom sheet that rises
 *   with the iOS sheet curve and can be dragged down (from its top) to close.
 * - A frame in the landing CTA's blue gradient around a warm white card.
 * - Three separate fields with floating labels and inline icons (name, phone,
 *   email), then a full-width blue button with its own shine and arrow.
 * - Name is required, and at least one of phone / email. Errors are gentle,
 *   inline and only show after the visitor has touched a field or tried to send.
 * - Nothing is stored yet: see ./submit-lead.js.
 * - Accessible: dialog role, focus trap, Escape / backdrop close, scroll lock
 *   (Lenis + overflow), reduced motion.
 *
 * @param {{ onClose: () => void }} props
 */
export function ContactModal({ onClose }) {
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const titleId = `${baseId}-title`;

  const dialogRef = useRef(null);
  const formRef = useRef(null);
  const nameRef = useRef(null);
  const phoneRef = useRef(null);
  const emailRef = useRef(null);
  const doneRef = useRef(null);

  const shake = useAnimationControls();
  const dragControls = useDragControls();

  const [isSheet] = useState(() => window.matchMedia(SHEET_QUERY).matches);
  const [values, setValues] = useState({ name: '', phone: '', email: '' });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | sending | done
  const [submitError, setSubmitError] = useState('');
  const [formHeight, setFormHeight] = useState(null);

  const errors = validate(values);
  const show = key => (submitted || touched[key] ? errors[key] : undefined);
  const isValid = key => Boolean(values[key].trim()) && !errors[key];
  const contactError =
    submitted || (touched.phone && touched.email) ? errors.contact : undefined;

  //? scroll lock, Escape, and a focus trap, for as long as the popup is open
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    const lenis = getLenis();
    const previousOverflow = root.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - root.clientWidth;

    lenis?.stop();
    root.style.overflow = 'hidden';
    //? keep the page from jumping sideways when the scrollbar disappears
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    const onKeyDown = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;
      const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || active === dialogRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      root.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      lenis?.start();
    };
  }, [onClose]);

  //? first focus: the name field with a mouse, the dialog itself on touch
  //? screens (so the keyboard doesn't leap up before they have seen the popup)
  useEffect(() => {
    const coarse = window.matchMedia(COARSE_QUERY).matches;
    const timer = setTimeout(() => {
      (coarse ? dialogRef.current : nameRef.current)?.focus({
        preventScroll: true,
      });
    }, 80);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status === 'done') doneRef.current?.focus({ preventScroll: true });
  }, [status]);

  const update = key => event => {
    const raw = event.target.value;
    //? phone: only the characters a phone number can hold
    const value = key === 'phone' ? raw.replace(/[^\d+\-()\s.]/g, '') : raw;
    setValues(current => ({ ...current, [key]: value }));
    if (submitError) setSubmitError('');
  };

  const markTouched = key => () =>
    setTouched(current => ({ ...current, [key]: true }));

  async function handleSubmit(event) {
    event.preventDefault();
    if (status === 'sending') return;
    setSubmitted(true);

    const found = validate(values);
    if (Object.keys(found).length > 0) {
      if (!reduceMotion) {
        shake.start({ x: [0, -9, 8, -6, 4, 0], transition: { duration: 0.45 } });
      }
      let target = emailRef;
      if (found.name) target = nameRef;
      else if (found.phone || found.contact) target = phoneRef;
      target.current?.focus();
      return;
    }

    setFormHeight(formRef.current?.offsetHeight ?? null);
    setSubmitError('');
    setStatus('sending');
    try {
      await submitLead({
        name: values.name.trim(),
        phone: values.phone.trim(),
        email: values.email.trim(),
      });
      setStatus('done');
    } catch {
      setStatus('idle');
      setSubmitError(
        'Something went wrong on our side. Please try again in a moment.',
      );
    }
  }

  const firstName = values.name.trim().split(/\s+/)[0];
  const reachAt = values.email.trim() || values.phone.trim();
  const sending = status === 'sending';

  let dialogMotion;
  if (reduceMotion) {
    dialogMotion = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.15 },
    };
  } else if (isSheet) {
    dialogMotion = {
      initial: { y: '100%' },
      animate: { y: 0, transition: SPRING },
      exit: { y: '100%', transition: { duration: 0.3, ease: IOS_EASE } },
    };
  } else {
    dialogMotion = {
      initial: { opacity: 0, scale: 0.92, y: 28 },
      animate: { opacity: 1, scale: 1, y: 0, transition: SPRING },
      exit: {
        opacity: 0,
        scale: 0.96,
        y: 12,
        transition: { duration: 0.2, ease: IOS_EASE },
      },
    };
  }

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={dialogRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        tabIndex={-1}
        data-lenis-prevent=''
        className={styles.dialog}
        drag={isSheet && !reduceMotion ? 'y' : false}
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.55 }}
        onDragEnd={(_, info) => {
          if (info.offset.y > 110 || info.velocity.y > 600) onClose();
        }}
        {...dialogMotion}
      >
        <div className={styles.frame}>
          <div className={styles.card}>
            {/* top strip: on phones this is the drag handle for the sheet */}
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
            <div
              className={styles.dragZone}
              onPointerDown={event => {
                if (isSheet) dragControls.start(event);
              }}
            >
              <span className={styles.grab} aria-hidden='true' />
              <div className={styles.head}>
                <span className={styles.eyebrow}>
                  <span className={styles.eyebrowDot} aria-hidden='true' />
                  Let’s talk
                </span>
                <button
                  type='button'
                  className={styles.close}
                  aria-label='Close'
                  onClick={onClose}
                >
                  <X size={17} strokeWidth={2.5} aria-hidden='true' />
                </button>
              </div>
            </div>

            <AnimatePresence mode='wait' initial={false}>
              {status === 'done' ? (
                <SuccessView
                  key='done'
                  firstName={firstName}
                  reachAt={reachAt}
                  formHeight={formHeight}
                  onDone={onClose}
                  doneRef={doneRef}
                />
              ) : (
                <motion.form
                  key='form'
                  ref={formRef}
                  noValidate
                  onSubmit={handleSubmit}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <h2 id={titleId} className={styles.title}>
                    Tell us about <em className={styles.titleEm}>you</em>
                  </h2>
                  <p className={styles.sub}>
                    Share a few details and our team will take it from here.
                  </p>

                  <motion.div animate={shake}>
                    <div className={styles.group}>
                      <Field
                        id={`${baseId}-name`}
                        icon={User}
                        label='Your name'
                        inputRef={nameRef}
                        type='text'
                        name='name'
                        placeholder='Jane Appleseed'
                        autoComplete='name'
                        autoCapitalize='words'
                        enterKeyHint='next'
                        value={values.name}
                        onChange={update('name')}
                        onBlur={markTouched('name')}
                        error={show('name')}
                        valid={isValid('name')}
                      />
                      <Field
                        id={`${baseId}-phone`}
                        icon={Phone}
                        label='Phone number'
                        inputRef={phoneRef}
                        type='tel'
                        name='phone'
                        placeholder='+91 98765 43210'
                        autoComplete='tel'
                        inputMode='tel'
                        enterKeyHint='next'
                        value={values.phone}
                        onChange={update('phone')}
                        onBlur={markTouched('phone')}
                        error={show('phone')}
                        valid={isValid('phone')}
                      />
                      <Field
                        id={`${baseId}-email`}
                        icon={Mail}
                        label='Email address'
                        inputRef={emailRef}
                        type='email'
                        name='email'
                        placeholder='jane@example.com'
                        autoComplete='email'
                        inputMode='email'
                        autoCapitalize='none'
                        spellCheck={false}
                        enterKeyHint='send'
                        value={values.email}
                        onChange={update('email')}
                        onBlur={markTouched('email')}
                        error={show('email')}
                        valid={isValid('email')}
                      />
                    </div>
                  </motion.div>

                  <p
                    className={styles.hint}
                    data-invalid={contactError ? 'true' : undefined}
                    role={contactError ? 'alert' : undefined}
                  >
                    <Info size={14} strokeWidth={2.25} aria-hidden='true' />
                    <span>
                      {contactError ||
                        'Phone or email, whichever you like. One is enough.'}
                    </span>
                  </p>

                  {submitError ? (
                    <p className={styles.submitError} role='alert'>
                      {submitError}
                    </p>
                  ) : null}

                  <button
                    type='submit'
                    className={styles.cta}
                    aria-disabled={sending}
                    aria-busy={sending}
                  >
                    <span className={styles.ctaLabel}>
                      {sending ? (
                        <>
                          <span className={styles.spin} aria-hidden='true' />
                          Sending…
                        </>
                      ) : (
                        <>
                          Send my details
                          <ArrowRight
                            className={styles.ctaArrow}
                            size={20}
                            strokeWidth={2.4}
                            aria-hidden='true'
                          />
                        </>
                      )}
                    </span>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <div className={styles.foot}>
            <span className={styles.footNote}>
              <Lock size={13} strokeWidth={2.5} aria-hidden='true' />
              We’ll only use this to get back to you
            </span>
            <kbd className={styles.kbd} aria-hidden='true'>
              Esc
            </kbd>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
