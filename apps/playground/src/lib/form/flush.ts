import type { AnyFormApi } from "@tanstack/react-form"
import { useEffect, useSyncExternalStore } from "react"

// Keyed by store: `useAppForm` returns a copy of the `FormApi` that `field.form` points to
const pending = new WeakMap<AnyFormApi["store"], Set<() => void | Promise<void>>>()

/**
 * Registers a field's flush, so {@link submitForm} writes its pending value before submitting.
 * Return a promise to make the submit wait.
 */
export const useFlushOnSubmit = (form: AnyFormApi, flush: () => void | Promise<void>) => {
  useEffect(() => {
    const flushes = pending.get(form.store) ?? new Set()
    pending.set(form.store, flushes)
    flushes.add(flush)
    return () => {
      flushes.delete(flush)
    }
  }, [form, flush])
}

const uploads = new WeakMap<AnyFormApi["store"], Set<Promise<unknown>>>()
const uploadListeners = new WeakMap<AnyFormApi["store"], Set<() => void>>()

const notifyUploads = (form: AnyFormApi) => {
  for (const listener of uploadListeners.get(form.store) ?? []) listener()
}

/**
 * Marks an upload as running until it settles. {@link submitForm} waits for it, and
 * {@link useIsUploading} is true meanwhile.
 */
export const trackUpload = (form: AnyFormApi, upload: Promise<unknown>) => {
  const running = uploads.get(form.store) ?? new Set()
  uploads.set(form.store, running)
  running.add(upload)
  notifyUploads(form)
  const done = () => {
    running.delete(upload)
    notifyUploads(form)
  }
  upload.then(done, done)
}

/**
 * Whether any upload passed to {@link trackUpload} is still running
 */
export const useIsUploading = (form: AnyFormApi) =>
  useSyncExternalStore(
    (listener) => {
      const listeners = uploadListeners.get(form.store) ?? new Set()
      uploadListeners.set(form.store, listeners)
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
    () => (uploads.get(form.store)?.size ?? 0) > 0,
    () => false,
  )

// Lets a second click during the upload wait reuse the first submit
const submitting = new WeakMap<AnyFormApi["store"], Promise<void>>()

/**
 * Flushes pending field values and waits for uploads, then submits. Use this in place of
 * `form.handleSubmit()`, as Enter or a shortcut submits without blurring the field first.
 */
export const submitForm = (form: AnyFormApi) => {
  const current = submitting.get(form.store)
  if (current) return current
  const submit = (async () => {
    await Promise.all([
      ...Array.from(pending.get(form.store) ?? [], (flush) => flush()),
      // Settled, not all, as each upload shows its own error and a failure must not stop the save
      Promise.allSettled(uploads.get(form.store) ?? []),
    ])
    await form.handleSubmit()
  })().finally(() => submitting.delete(form.store))
  submitting.set(form.store, submit)
  return submit
}
