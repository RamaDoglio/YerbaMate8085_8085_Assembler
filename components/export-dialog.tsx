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
          <DialogTitle>Exportar a PDF</DialogTitle>
          <DialogDescription>
            Complete los datos para generar el documento.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="student-name">Nombre del alumno</Label>
            <Input
              id="student-name"
              placeholder="Ingrese su nombre..."
              value={studentName}
              onChange={(e) => {
                onStudentNameChange(e.target.value)
                setNameError(false)
              }}
              className={nameError ? 'border-destructive' : ''}
            />
            {nameError && (
              <p className="text-xs text-destructive">
                Debe ingresar un nombre para continuar.
              </p>
            )}
          </div>

          {!hasStepped && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-medium">No se ha ejecutado el programa paso a paso.</p>
              <p className="mt-1">
                Para guardar la prueba de escritorio, seleccione una de las opciones de abajo.
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
                <span>Guardar Plantilla y Prueba de Escritorio</span>
                <span className="text-xs opacity-70 font-normal">
                  (Se ejecutará automáticamente paso a paso)
                </span>
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleOnlyTemplate}
                disabled={disabled}
              >
                Guardar solo Plantilla del Código
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleClose}
              >
                Cancelar
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
                Exportar PDF
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleClose}
              >
                Cancelar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
