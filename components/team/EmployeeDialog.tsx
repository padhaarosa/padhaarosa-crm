"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Field";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createEmployee, updateEmployee } from "@/app/actions/team";
import { dateInputValue, cn } from "@/lib/utils";

type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  designation: string;
  department: string;
  location: string;
  target: number;
  joinedAt: Date | string;
};

const ROLES = ["Admin", "Manager", "Agent"];
const DEPARTMENTS = ["Leadership", "Sales", "Operations", "Events", "Marketing", "Support"];

export function EmployeeDialog({
  employee,
  variant = "primary",
  label,
  className,
}: {
  employee?: Employee;
  variant?: "primary" | "secondary";
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = !!employee;

  useEffect(() => {
    if (!isEdit && searchParams.get("new") === "1") setOpen(true);
  }, [searchParams, isEdit]);

  function close() {
    setOpen(false);
    if (!isEdit && searchParams.get("new")) router.replace("/team");
  }

  async function submit(fd: FormData) {
    if (isEdit) await updateEmployee(employee!.id, fd);
    else await createEmployee(fd);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className={cn(variant === "primary" ? "btn-primary" : "btn-secondary", className)}>
        {isEdit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {label ?? (isEdit ? "Edit" : "Add Member")}
      </button>

      <Modal open={open} onClose={close} title={isEdit ? "Edit Team Member" : "Add Team Member"} subtitle={isEdit ? employee!.name : "Add a new employee to your team"} size="lg">
        <form action={submit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name" required><Input name="name" defaultValue={employee?.name} required /></Field>
            <Field label="Email" required><Input name="email" type="email" defaultValue={employee?.email} required /></Field>
            <Field label="Phone"><Input name="phone" defaultValue={employee?.phone ?? ""} /></Field>
            <Field label="Location"><Input name="location" defaultValue={employee?.location ?? "Jaipur"} /></Field>
            <Field label="Designation"><Input name="designation" defaultValue={employee?.designation ?? "Travel Consultant"} /></Field>
            <Field label="Department"><Select name="department" defaultValue={employee?.department ?? "Sales"} options={DEPARTMENTS} /></Field>
            <Field label="Role"><Select name="role" defaultValue={employee?.role ?? "Agent"} options={ROLES} /></Field>
            <Field label="Monthly target (₹)"><Input name="target" type="number" min={0} step={50000} defaultValue={employee?.target ?? 500000} /></Field>
            <Field label="Joined on"><Input name="joinedAt" type="date" defaultValue={dateInputValue(employee?.joinedAt ?? new Date())} /></Field>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
            <button type="button" onClick={close} className="btn-ghost">Cancel</button>
            <SubmitButton>{isEdit ? "Save Member" : "Add Member"}</SubmitButton>
          </div>
        </form>
      </Modal>
    </>
  );
}
