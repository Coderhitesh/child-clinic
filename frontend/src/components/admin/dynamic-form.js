"use client";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/ui/file-upload";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { SimpleSelect } from "@/components/ui/select";
import { WEEK_DAYS } from "@/lib/constants";
import { cn } from "@/lib/utils";
export const getPath = (obj, path) => {
  if (!path || typeof path !== "string") {
    return undefined;
  }

  return path
    .split(".")
    .reduce((acc, part) => (acc == null ? acc : acc[part]), obj);
};
export const setPath = (obj, path, value) => {
  if (!path || typeof path !== "string") {
    return obj;
  }

  const parts = path.split(".");
  const next = Array.isArray(obj) ? [...obj] : { ...obj };

  let cur = next;

  parts.forEach((p, i) => {
    if (i === parts.length - 1) {
      cur[p] = value;
    } else {
      cur[p] =
        cur[p] && typeof cur[p] === "object"
          ? Array.isArray(cur[p])
            ? [...cur[p]]
            : { ...cur[p] }
          : {};

      cur = cur[p];
    }
  });

  return next;
};

// Renders a form from a field schema. Supported types:
// text, email, password, number, textarea, html, select, multiselect,
// switch, date, datetime, image, tags, days, section
export default function DynamicForm({ fields, value, onChange, lookups = {} }) {
  const set = (name, v) => onChange(setPath(value, name, v));

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(fields || []).map((f, index) => {
        if (!f) return null;

        if (f.type === "section") {
          return (
            <div
              key={f.label}
              className="sm:col-span-2 border-t border-border pt-4 first:border-0 first:pt-0"
            >
              <p className="text-sm font-semibold text-ink">{f.label}</p>
              {f.help && (
                <p className="mt-0.5 text-xs text-muted-foreground">{f.help}</p>
              )}
            </div>
          );
        }

        if (!f.name || typeof f.name !== "string") {
          console.warn("DynamicForm: Field is missing a valid name:", {
            index,
            field: f,
          });

          return null;
        }

       
        const v = getPath(value, f.name);
        const options = f.optionsFrom
          ? lookups[f.optionsFrom] || []
          : f.options || [];

        return (
          <div
            key={f.name}
            className={cn(
              f.full ||
                [
                  "textarea",
                  "html",
                  "tags",
                  "days",
                  "multiselect",
                  "images",
                ].includes(f.type)
                ? "sm:col-span-2"
                : "",
            )}
          >
            {f.type !== "switch" && (
              <Label className="mb-1.5 block">
                {f.label}{" "}
                {f.required && <span className="text-coral-500">*</span>}
              </Label>
            )}

            {(() => {
              switch (f.type) {
                case "textarea":
                  return (
                    <Textarea
                      rows={f.rows || 4}
                      value={v ?? ""}
                      onChange={(e) => set(f.name, e.target.value)}
                      placeholder={f.placeholder}
                    />
                  );
                case "html":
                  return (
                    <Textarea
                      rows={f.rows || 10}
                      value={v ?? ""}
                      onChange={(e) => set(f.name, e.target.value)}
                      placeholder={
                        f.placeholder || "<p>Write HTML content…</p>"
                      }
                      className="font-mono text-xs"
                    />
                  );
                case "number":
                  return (
                    <Input
                      type="number"
                      value={v ?? ""}
                      onChange={(e) =>
                        set(
                          f.name,
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      placeholder={f.placeholder}
                      min={f.min}
                      max={f.max}
                    />
                  );
                case "select":
                  return (
                    <SimpleSelect
                      value={idish(v)}
                      onChange={(nv) => set(f.name, nv)}
                      options={options}
                      placeholder={f.placeholder || "Select"}
                      allowEmpty={!f.required}
                      emptyLabel={f.emptyLabel || "None"}
                    />
                  );
                case "multiselect":
                  return (
                    <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-lg border border-border p-3">
                      {options.length === 0 && (
                        <span className="text-xs text-muted-foreground">
                          Nothing to choose from yet.
                        </span>
                      )}
                      {options.map((o) => {
                        const list = (v || []).map(idish);
                        const checked = list.includes(String(o.value));
                        return (
                          <label
                            key={o.value}
                            className="flex items-center gap-2 text-sm"
                          >
                            <Checkbox
                              checked={checked}
                              onCheckedChange={(c) =>
                                set(
                                  f.name,
                                  c
                                    ? [...list, String(o.value)]
                                    : list.filter((x) => x !== String(o.value)),
                                )
                              }
                            />
                            {o.label}
                          </label>
                        );
                      })}
                    </div>
                  );
                case "days":
                  return (
                    <div className="flex flex-wrap gap-2">
                      {WEEK_DAYS.map((d) => {
                        const list = v || [];
                        const on = list.includes(d.value);
                        return (
                          <button
                            type="button"
                            key={d.value}
                            onClick={() =>
                              set(
                                f.name,
                                on
                                  ? list.filter((x) => x !== d.value)
                                  : [...list, d.value],
                              )
                            }
                            className={cn(
                              "rounded-lg border px-3 py-1.5 text-xs",
                              on
                                ? "border-brand-600 bg-brand-600 text-white"
                                : "border-border text-ink-soft",
                            )}
                          >
                            {d.label}
                          </button>
                        );
                      })}
                    </div>
                  );
                case "switch":
                  return (
                    <label className="flex h-10 items-center gap-3 rounded-lg border border-border px-3">
                      <Switch
                        checked={Boolean(v)}
                        onCheckedChange={(c) => set(f.name, c)}
                      />
                      <span className="text-sm text-ink">{f.label}</span>
                    </label>
                  );
                case "date":
                  return (
                    <Input
                      type="date"
                      value={toDateInput(v)}
                      onChange={(e) => set(f.name, e.target.value)}
                    />
                  );
                case "datetime":
                  return (
                    <Input
                      type="datetime-local"
                      value={toDateTimeInput(v)}
                      onChange={(e) => set(f.name, e.target.value)}
                    />
                  );
                case "time":
                  return (
                    <Input
                      type="time"
                      value={v ?? ""}
                      onChange={(e) => set(f.name, e.target.value)}
                    />
                  );
                case "tags":
                  return (
                    <Input
                      value={Array.isArray(v) ? v.join(", ") : (v ?? "")}
                      onChange={(e) =>
                        set(
                          f.name,
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder={f.placeholder || "Comma separated"}
                    />
                  );
                case "image":
                  return (
                    <FileUpload
                      value={v ?? ""}
                      onChange={(url) => set(f.name, url)}
                      accept={f.accept || "image/*"}
                      label={f.uploadLabel || "Upload image"}
                    />
                  );
                case "images":
                  return (
                    <FileUpload
                      value={Array.isArray(v) ? v : []}
                      onChange={(urls) => set(f.name, urls)}
                      accept={f.accept || "image/*"}
                      label={f.uploadLabel || "Upload images"}
                      multiple
                      maxFiles={f.maxFiles}
                    />
                  );
                case "file":
                  return (
                    <FileUpload
                      value={v ?? ""}
                      onChange={(url) => set(f.name, url)}
                      accept={f.accept || "image/*,application/pdf"}
                      label={f.uploadLabel || "Upload file"}
                      preview={false}
                    />
                  );
                default:
                  return (
                    <Input
                      type={f.type || "text"}
                      value={v ?? ""}
                      onChange={(e) => set(f.name, e.target.value)}
                      placeholder={f.placeholder}
                    />
                  );
              }
            })()}

            {f.help && f.type !== "switch" && (
              <p className="mt-1 text-xs text-muted-foreground">{f.help}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

const idish = (v) =>
  v && typeof v === "object" ? String(v._id) : v == null ? "" : String(v);
const toDateInput = (v) => (v ? String(v).slice(0, 10) : "");
const toDateTimeInput = (v) =>
  v ? new Date(v).toISOString().slice(0, 16) : "";
