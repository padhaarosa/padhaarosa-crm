"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createPost, updatePost } from "@/app/actions/social";
import { SOCIAL_CHANNELS, POST_STATUSES, POST_STATUS_META } from "@/lib/constants";
import { dateInputValue, cn } from "@/lib/utils";

type Post = {
  id: string;
  channel: string;
  content: string;
  campaign: string | null;
  status: string;
  scheduledAt: Date | string | null;
  publishedAt: Date | string | null;
};

export function SocialPostDialog({
  post,
  variant = "primary",
  label,
  className,
}: {
  post?: Post;
  variant?: "primary" | "secondary";
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(post?.status ?? "SCHEDULED");
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!post;

  useEffect(() => {
    if (!isEdit && searchParams.get("new") === "1") setOpen(true);
  }, [searchParams, isEdit]);

  function close() {
    setOpen(false);
    if (!isEdit && searchParams.get("new")) router.replace("/social");
  }

  async function submit(fd: FormData) {
    if (isEdit) await updatePost(post!.id, fd);
    else await createPost(fd);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={cn(variant === "primary" ? "btn-primary" : "btn-secondary", className)}>
        {isEdit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {label ?? (isEdit ? "Edit" : "Compose Post")}
      </button>

      <Modal open={open} onClose={close} title={isEdit ? "Edit Post" : "Compose Post"} subtitle="Plan and schedule content across channels" size="lg">
        <form action={submit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Channel" required>
              <Select name="channel" defaultValue={post?.channel ?? "Instagram"} options={SOCIAL_CHANNELS} />
            </Field>
            <Field label="Campaign">
              <Input name="campaign" defaultValue={post?.campaign ?? ""} placeholder="e.g. Desert Season" />
            </Field>
          </div>
          <Field label="Content" required>
            <Textarea name="content" defaultValue={post?.content} placeholder="Write your caption…" className="min-h-[110px]" required />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Status">
              <Select name="status" value={status} onChange={(e) => setStatus(e.target.value)} options={POST_STATUSES.map((s) => ({ value: s, label: POST_STATUS_META[s].label }))} />
            </Field>
            {status !== "DRAFT" && (
              <Field label={status === "PUBLISHED" ? "Published date" : "Schedule for"}>
                <Input name="scheduledAt" type="date" defaultValue={dateInputValue(post?.scheduledAt ?? post?.publishedAt ?? new Date())} />
              </Field>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
            <button type="button" onClick={close} className="btn-ghost">Cancel</button>
            <SubmitButton>{isEdit ? "Save Post" : "Create Post"}</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
