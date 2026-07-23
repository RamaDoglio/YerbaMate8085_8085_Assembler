'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/lib/i18n'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hasStepped: boolean
  studentName: string
  onStudentNameChange: (name: string) => void
  onExportOnlyTemplate: () => void
  onExportFull: () => void
  disabled?: boolean
}

export function ExportDialog({
  open,
  onOpenChange,
  hasStepped,
  studentName,
  onStudentNameChange,
  onExportOnlyTemplate,
  onExportFull,
  disabled,
}: ExportDialogProps) {
  const { t } = useLanguage()
  const [nameError, setNameError] = useState(false)

  const validateName = () => {
    if (!studentName.trim()) {
      setNameError(true)
      return false
    }
    setNameError(false)
    return true
  }

  const handleOnlyTemplate = () => {
    if (!validateName()) return
    onExportOnlyTemplate()
  }

  const handleFull = () => {
    if (!validateName()) return
    onExportFull()
  }

  const handleClose = () => {
    onOpenChange(false)
    setNameError(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" showCloseButton>
        <DialogHeader>
          <DialogTitle>{t('exportDialog.title')}</DialogTitle>
          <DialogDescription>
            {t('exportDialog.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="student-name">{t('exportDialog.studentNameLabel')}</Label>
            <Input
              id="student-name"
              placeholder={t('exportDialog.studentNamePlaceholder')}
              value={studentName}
              onChange={(e) => {
                onStudentNameChange(e.target.value)
                setNameError(false)
              }}
              className={nameError ? 'border-destructive' : ''}
            />
            {nameError && (
              <p className="text-xs text-destructive">
                {t('exportDialog.nameRequired')}
              </p>
            )}
          </div>

          {!hasStepped && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-medium">{t('exportDialog.noStepWarning')}</p>
              <p className="mt-1">
                {t('exportDialog.stepHint')}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {!hasStepped ? (
            <>
              <Button
                variant="default"
                className="w-full h-auto min-h-[40px] py-2 flex flex-col items-center gap-0 leading-tight"
                onClick={handleFull}
                disabled={disabled}
              >
                <span>{t('exportDialog.saveFull')}</span>
                <span className="text-xs opacity-70 font-normal">
                  {t('exportDialog.saveFullHint')}
                </span>
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleOnlyTemplate}
                disabled={disabled}
              >
                {t('exportDialog.saveTemplateOnly')}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleClose}
              >
                {t('exportDialog.cancel')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                className="w-full"
                onClick={handleFull}
                disabled={disabled}
              >
                {t('exportDialog.exportPdf')}
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleClose}
              >
                {t('exportDialog.cancel')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
