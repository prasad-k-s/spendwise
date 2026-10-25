"use client";

import { useActionState } from "react";
import { Loader2, Plus } from "lucide-react";

import { createGroup, type CreateGroupState } from "@/app/(app)/groups/actions";
import { FieldError } from "@/components/auth/field-error";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CreateGroupState = {};

function CreateGroupForm() {
  const [state, formAction, isPending] = useActionState(createGroup, initialState);
  const errors = state.fieldErrors;

  return (
    <form action={formAction} className="grid gap-5" noValidate>
      {state.error && (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
        >
          {state.error}
        </p>
      )}
      <div className="grid gap-2">
        <Label htmlFor="group-name">Group name</Label>
        <Input
          id="group-name"
          name="name"
          placeholder="e.g. Flat 4B, Goa trip"
          maxLength={60}
          autoComplete="off"
          defaultValue={state.values?.name}
          aria-invalid={!!errors?.name}
          aria-describedby={errors?.name ? "group-name-error" : undefined}
          autoFocus
        />
        <FieldError id="group-name-error" errors={errors?.name} />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="animate-spin" />}
        Create group
      </Button>
    </form>
  );
}

export function CreateGroupDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Create group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create a group</DialogTitle>
          <DialogDescription>
            Share expenses with flatmates, friends or family. You&apos;ll be able to invite people
            next.
          </DialogDescription>
        </DialogHeader>
        <CreateGroupForm />
      </DialogContent>
    </Dialog>
  );
}
