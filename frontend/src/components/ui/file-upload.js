'use client';

import { useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Upload,
  X,
  FileText,
  Link2,
  Images,
} from 'lucide-react';

import { uploadApi } from '@/services';
import { Button } from './button';
import { Input } from './input';
import { Spinner } from './spinner';
import { cn, getErr } from '@/lib/utils';

const isImage = (url = '') =>
  /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(url);

export function FileUpload({
  value,
  onChange,
  accept = 'image/*',
  label = 'Upload a file',
  preview = true,
  multiple = false,
  maxFiles,
  className,
}) {
  const inputRef = useRef(null);

  const [busy, setBusy] = useState(false);
  const [manual, setManual] = useState(false);
  const [manualUrl, setManualUrl] = useState('');

  const values = multiple
    ? Array.isArray(value)
      ? value
      : value
        ? [value]
        : []
    : [];

  /*
   * SINGLE FILE UPLOAD
   */
  const pickSingle = async (file) => {
    if (!file) return;

    setBusy(true);

    try {
      const res = await uploadApi.file(file);
      
      onChange(res.url, res);

      toast.success('File uploaded');
    } catch (e) {
      toast.error(getErr(e));
    } finally {
      setBusy(false);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  /*
   * MULTIPLE FILE UPLOAD
   */
  const pickMultiple = async (files) => {
    const selectedFiles = Array.from(files || []);

    if (!selectedFiles.length) return;

    /*
     * Max file validation
     */
    if (
      maxFiles &&
      values.length + selectedFiles.length > maxFiles
    ) {
      toast.error(`Maximum ${maxFiles} images allowed`);
      return;
    }

    setBusy(true);

    try {
      /*
       * Upload all images in parallel
       */
      const responses = await Promise.all(
        selectedFiles.map((file) => uploadApi.file(file))
      );

      const uploadedUrls = responses
        .map((res) => res?.url)
        .filter(Boolean);

      onChange(
        [...values, ...uploadedUrls],
        responses
      );

      toast.success(
        `${uploadedUrls.length} file${
          uploadedUrls.length > 1 ? 's' : ''
        } uploaded`
      );
    } catch (e) {
      toast.error(getErr(e));
    } finally {
      setBusy(false);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  /*
   * INPUT CHANGE
   */
  const handlePick = (e) => {
    if (multiple) {
      pickMultiple(e.target.files);
    } else {
      pickSingle(e.target.files?.[0]);
    }
  };

  /*
   * REMOVE SINGLE VALUE
   */
  const clearSingle = () => {
    onChange('');
  };

  /*
   * REMOVE IMAGE FROM ARRAY
   */
  const removeMultiple = (index) => {
    const next = values.filter((_, i) => i !== index);

    onChange(next);
  };

  /*
   * ADD MANUAL URL
   */
  const addManualUrl = () => {
    const url = manualUrl.trim();

    if (!url) return;

    if (multiple) {
      if (maxFiles && values.length >= maxFiles) {
        toast.error(`Maximum ${maxFiles} images allowed`);
        return;
      }

      onChange([...values, url]);
    } else {
      onChange(url);
    }

    setManualUrl('');
    setManual(false);
  };

  /*
   * MULTIPLE MODE
   */
  if (multiple) {
    return (
      <div className={cn('space-y-3', className)}>

        {/* Existing uploaded images */}
        {values.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {values.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="group relative overflow-hidden rounded-xl border bg-muted"
              >
                {preview && isImage(url) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={`Uploaded image ${index + 1}`}
                    className="h-32 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center">
                    <FileText className="h-7 w-7 text-muted-foreground" />
                  </div>
                )}

                {/* Remove */}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeMultiple(index)}
                  className="absolute right-2 top-2 h-7 w-7 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Position */}
                <div className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            multiple
            className="hidden"
            onChange={handlePick}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={
              busy ||
              (maxFiles && values.length >= maxFiles)
            }
          >
            {busy ? (
              <Spinner />
            ) : (
              <Images className="h-4 w-4" />
            )}

            {busy ? 'Uploading...' : label}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setManual((m) => !m)}
            disabled={
              maxFiles && values.length >= maxFiles
            }
          >
            <Link2 className="h-4 w-4" />
            Paste a link
          </Button>

          {maxFiles && (
            <span className="text-xs text-muted-foreground">
              {values.length}/{maxFiles}
            </span>
          )}
        </div>

        {/* Manual URL */}
        {manual && (
          <div className="flex gap-2">
            <Input
              value={manualUrl}
              placeholder="https://example.com/image.jpg"
              onChange={(e) => setManualUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addManualUrl();
                }
              }}
            />

            <Button
              type="button"
              onClick={addManualUrl}
              disabled={!manualUrl.trim()}
            >
              Add
            </Button>
          </div>
        )}
      </div>
    );
  }

  /*
   * SINGLE MODE
   */
  return (
    <div className={cn('space-y-2', className)}>
      {value ? (
        <div className="flex items-center gap-3 rounded-xl border p-2.5">
          {preview && isImage(value) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt=""
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <FileText className="h-5 w-5" />
            </span>
          )}

          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="min-w-0 flex-1 truncate text-sm text-brand-700 hover:underline"
          >
            {value.split('/').pop()}
          </a>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={clearSingle}
            aria-label="Remove"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            onChange={handlePick}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            {busy ? (
              <Spinner />
            ) : (
              <Upload className="h-4 w-4" />
            )}

            {label}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setManual((m) => !m)}
          >
            <Link2 className="h-4 w-4" />
            Paste a link
          </Button>
        </div>
      )}

      {manual && !value && (
        <div className="flex gap-2">
          <Input
            value={manualUrl}
            placeholder="https://example.com/image.jpg"
            onChange={(e) => setManualUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addManualUrl();
              }
            }}
          />

          <Button
            type="button"
            onClick={addManualUrl}
            disabled={!manualUrl.trim()}
          >
            Add
          </Button>
        </div>
      )}
    </div>
  );
}

export default FileUpload;