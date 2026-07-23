'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { useLanguage } from '@/lib/i18n'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Kbd } from '@/components/ui/kbd'
import { 
  Play, 
  Square, 
  SkipForward, 
  RotateCcw, 
  Hammer,
  Download,
  Upload,
  Cpu,
  Sun,
  Moon,
  FileDown,
  Languages
} from 'lucide-react'
import { cn } from '@/lib/utils'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = theme === 'dark'

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="h-8 w-8 p-0"
      aria-label={t('toolbar.themeLabel')}
    >
      {mounted ? (
        isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  )
}

function LanguageToggle() {
  const { locale, setLocale } = useLanguage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="h-8 w-8" />

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === 'es' ? 'en' : 'es')}
      className="h-8 w-auto px-2 gap-1 font-semibold text-xs"
      aria-label={locale === 'es' ? 'Switch to English' : 'Cambiar a Español'}
    >
      <Languages className="h-4 w-4" />
      {locale === 'es' ? 'EN' : 'ES'}
    </Button>
  )
}

interface SimulatorToolbarProps {
  onAssemble: () => void
  onRun: () => void
  onStep: () => void
  onStop: () => void
  onReset: () => void
  onLoad?: () => void
  onSave?: () => void
  onExport?: () => void
  isRunning: boolean
  isAssembled: boolean
  className?: string
}

export function SimulatorToolbar({
  onAssemble,
  onRun,
  onStep,
  onStop,
  onReset,
  onLoad,
  onSave,
  onExport,
  isRunning,
  isAssembled,
  className
}: SimulatorToolbarProps) {
  const { t } = useLanguage()

  return (
    <div className={cn(
      'flex items-center gap-2 p-2 border-b border-border bg-card/50',
      className
    )}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-2">
        <Cpu className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">{t('toolbar.simulatorTitle')}</span>
      </div>

      <div className="h-6 w-px bg-border mx-2" />

      {/* File operations */}
      {onLoad && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onLoad} className="h-8 gap-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">{t('toolbar.open')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {t('toolbar.openTooltip')} <Kbd>Ctrl+O</Kbd>
          </TooltipContent>
        </Tooltip>
      )}
      {onSave && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" onClick={onSave} className="h-8 gap-2">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{t('toolbar.save')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {t('toolbar.saveTooltip')} <Kbd>Ctrl+S</Kbd>
          </TooltipContent>
        </Tooltip>
      )}

      {(onLoad || onSave) && <div className="h-6 w-px bg-border mx-2" />}

      {/* Assembler */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="default" 
            size="sm" 
            onClick={onAssemble}
            className="h-8 gap-2 bg-primary hover:bg-primary/90"
          >
            <Hammer className="h-4 w-4" />
            <span>{t('toolbar.assemble')}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {t('toolbar.assembleTooltip')} <Kbd>F7</Kbd> <span className="text-muted-foreground">{t('toolbar.or')}</span> <Kbd>Ctrl+Shift+A</Kbd>
        </TooltipContent>
      </Tooltip>

      <div className="h-6 w-px bg-border mx-2" />

      {/* Execution controls */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onRun}
            disabled={!isAssembled || isRunning}
            className="h-8 gap-2"
          >
            <Play className="h-4 w-4" />
            <span className="hidden sm:inline">{t('toolbar.run')}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {t('toolbar.runTooltip')} <Kbd>F5</Kbd>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onStep}
            disabled={!isAssembled || isRunning}
            className="h-8 gap-2"
          >
            <SkipForward className="h-4 w-4" />
            <span className="hidden sm:inline">{t('toolbar.step')}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {t('toolbar.stepTooltip')} <Kbd>F10</Kbd>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onStop}
            disabled={!isRunning}
            className="h-8 gap-2"
          >
            <Square className="h-4 w-4" />
            <span className="hidden sm:inline">{t('toolbar.stop')}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {t('toolbar.stopTooltip')}
        </TooltipContent>
      </Tooltip>

      <div className="h-6 w-px bg-border mx-2" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 gap-2 text-destructive hover:text-destructive"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="hidden sm:inline">{t('toolbar.reset')}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {t('toolbar.resetTooltip')} <Kbd>Ctrl+Shift+R</Kbd>
        </TooltipContent>
      </Tooltip>

      <div className="h-6 w-px bg-border mx-2" />

      {/* Export PDF */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={!isAssembled}
            className="h-8 gap-2"
          >
            <FileDown className="h-4 w-4" />
            <span className="hidden sm:inline">{t('toolbar.exportPdf')}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {t('toolbar.exportPdfTooltip')}
        </TooltipContent>
      </Tooltip>

      {/* Status indicator */}
      <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
        <div className={cn(
          'h-2 w-2 rounded-full',
          isRunning ? 'bg-green-500 animate-pulse' : 'bg-muted-foreground/30'
        )} />
        <span>{isRunning ? t('toolbar.statusRunning') : t('toolbar.statusReady')}</span>
      </div>

      <div className="h-6 w-px bg-border mx-2" />

      {/* Language toggle */}
      <LanguageToggle />

      {/* Theme toggle */}
      <ThemeToggle />
    </div>
  )
}
