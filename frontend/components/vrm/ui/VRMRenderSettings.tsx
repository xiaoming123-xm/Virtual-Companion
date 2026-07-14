import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { cn } from '@/utils/cn';
import { useLanguage } from '@/contexts/LanguageContext';
import { backgroundsApi, type BackgroundImage } from '../../../services/api/backgrounds';
import { useVRMStore } from '../../../store/vrm/useVRMStore';

const ADD_BACKGROUND_VALUE = '__add_background__';
const SUPPORTED_BACKGROUND_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const getBackgroundLabel = (filename: string, displayName: string, t: (key: string) => string) => {
    if (filename === 'BG_AronaRoom.jpg') {
        return t('vrm.background.aronaRoomOut');
    }
    if (filename === 'BG_AronaRoom_In.jpg') {
        return t('vrm.background.aronaRoomIn');
    }
    if (filename === 'BG_GameDevRoom.jpg') {
        return t('vrm.background.gameDevRoom');
    }
    return displayName;
};

export function VRMRenderSettings({ className }: { className?: string }) {
    const { t } = useLanguage();
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [backgrounds, setBackgrounds] = useState<BackgroundImage[]>([]);
    const [isBackgroundUploading, setIsBackgroundUploading] = useState(false);
    const [backgroundError, setBackgroundError] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const { config, setRenderConfig } = useVRMStore();

    const loadBackgrounds = async () => {
        const response = await backgroundsApi.getBackgrounds();
        if (response.code === 200) {
            setBackgrounds(response.data.backgrounds);
            setBackgroundError('');
            return;
        }
        setBackgroundError(t('vrm.background.loadFailed'));
    };

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            const response = await backgroundsApi.getBackgrounds();
            if (!isMounted) {
                return;
            }
            if (response.code === 200) {
                setBackgrounds(response.data.backgrounds);
                setBackgroundError('');
                return;
            }
            setBackgroundError(t('vrm.background.loadFailed'));
        };

        void load();

        return () => {
            isMounted = false;
        };
    }, [t]);

    const backgroundOptions = useMemo(() => [
        { value: 'none', label: t('vrm.background.none') },
        ...backgrounds.map((background) => ({
            value: background.filename,
            label: getBackgroundLabel(background.filename, background.display_name, t),
        })),
    ], [backgrounds, t]);

    const handleBackgroundSelect = (value: string) => {
        if (value === ADD_BACKGROUND_VALUE) {
            fileInputRef.current?.click();
            return;
        }
        setRenderConfig({ backgroundImage: value });
    };

    const handleBackgroundFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) {
            return;
        }
        if (!SUPPORTED_BACKGROUND_TYPES.includes(file.type)) {
            setBackgroundError(t('vrm.background.invalidFile'));
            return;
        }

        setIsBackgroundUploading(true);
        setBackgroundError('');

        try {
            const response = await backgroundsApi.uploadBackground(file);
            if (response.code !== 200) {
                setBackgroundError(response.message || t('vrm.background.uploadFailed'));
                return;
            }

            await loadBackgrounds();
            setRenderConfig({ backgroundImage: response.data.filename });
        } catch {
            setBackgroundError(t('vrm.background.uploadFailed'));
        } finally {
            setIsBackgroundUploading(false);
        }
    };

    return (
        <div className={cn(
            "bg-black/80 backdrop-blur-sm rounded-lg p-4 text-xs font-mono space-y-3 border border-white/10 shadow-lg min-w-[240px]",
            className
        )}>
            <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-400 font-semibold mb-1">
                    <Sparkles className="w-3 h-3 text-yellow-500" />
                    <span>{t('vrm.lightingSettings')}</span>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span>{t('vrm.mainLight')}</span>
                        <span className="text-blue-400 font-bold">{config.mainLightIntensity.toFixed(1)}</span>
                    </div>
                    <input
                        type="range" min="0" max="10" step="0.1"
                        value={config.mainLightIntensity}
                        onChange={(e) => setRenderConfig({ mainLightIntensity: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span>{t('vrm.ambientLight')}</span>
                        <span className="text-emerald-400 font-bold">{config.ambientLightIntensity.toFixed(1)}</span>
                    </div>
                    <input
                        type="range" min="0" max="5" step="0.1"
                        value={config.ambientLightIntensity}
                        onChange={(e) => setRenderConfig({ ambientLightIntensity: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span>{t('vrm.rimLight')}</span>
                        <span className="text-purple-400 font-bold">{config.rimLightIntensity.toFixed(1)}</span>
                    </div>
                    <input
                        type="range" min="0" max="5" step="0.1"
                        value={config.rimLightIntensity}
                        onChange={(e) => setRenderConfig({ rimLightIntensity: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            <div className="border-t border-white/10" />

            <div className="space-y-3">
                <ToggleItem
                    label={t('vrm.enableBlink')}
                    checked={config.enableBlink}
                    onChange={(checked) => setRenderConfig({ enableBlink: checked })}
                />

                <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-gray-400 uppercase tracking-widest">
                        <span>{t('vrm.lookAtMode')}</span>
                        <span className="text-blue-400 font-bold">{t(`vrm.lookAt.${config.lookAtMode}`)}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                        {(['mouse', 'camera', 'none'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => setRenderConfig({ lookAtMode: m })}
                                className={cn(
                                    "py-1 text-[10px] rounded border transition-all",
                                    config.lookAtMode === m
                                        ? "bg-white/20 border-white/30 text-white"
                                        : "bg-white/5 border-white/5 text-gray-500 hover:text-gray-300"
                                )}
                            >
                                {t(`vrm.lookAt.${m}`)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1.5">
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest">{t('vrm.selectBackground')}</div>
                    <select
                        value={config.backgroundImage || 'none'}
                        disabled={isBackgroundUploading}
                        onChange={(e) => handleBackgroundSelect(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-gray-300 focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-colors disabled:cursor-wait disabled:opacity-60"
                    >
                        {backgroundOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                        <option value={ADD_BACKGROUND_VALUE}>
                            {isBackgroundUploading ? t('vrm.background.uploading') : t('vrm.background.addImage')}
                        </option>
                    </select>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleBackgroundFileChange}
                    />
                    {backgroundError && (
                        <div className="text-[10px] text-red-300 leading-snug">
                            {backgroundError}
                        </div>
                    )}
                </div>
            </div>

            <div className="border-t border-white/10" />

            <div>
                <button
                    onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                    className="flex items-center justify-between w-full text-gray-500 hover:text-gray-300 transition-colors text-[10px] uppercase font-bold"
                >
                    <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>{t('vrm.advancedSettings')}</span>
                    </div>
                    {isAdvancedOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {isAdvancedOpen && (
                    <div className="mt-3 space-y-3 pt-3 border-t border-white/5 animate-in fade-in slide-in-from-top-1">
                        <ToggleItem
                            label={t('vrm.enablePostProcessing')}
                            checked={config.enablePostProcessing}
                            onChange={(checked) => setRenderConfig({ enablePostProcessing: checked })}
                        />

                        <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-gray-400">
                                <span>{t('vrm.bloomIntensity')}</span>
                                <span>{config.bloomIntensity.toFixed(1)}</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={config.bloomIntensity}
                                onChange={(e) => setRenderConfig({ bloomIntensity: parseFloat(e.target.value) })}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                            <ToggleItem
                                label={t('vrm.shadows')}
                                checked={config.enableContactShadows}
                                onChange={(checked) => setRenderConfig({ enableContactShadows: checked })}
                            />
                            <ToggleItem
                                label={t('vrm.bloom')}
                                checked={config.enableBloom}
                                onChange={(checked) => setRenderConfig({ enableBloom: checked })}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ToggleItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
    return (
        <label className="flex items-center justify-between cursor-pointer group">
            <span className={cn(
                "text-gray-300 group-hover:text-white transition-colors",
                checked && "text-white"
            )}>
                {label}
            </span>
            <div
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative w-8 h-4 rounded-full transition-colors",
                    checked ? "bg-blue-500" : "bg-white/20"
                )}
            >
                <div
                    className={cn(
                        "absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform",
                        checked ? "translate-x-4" : "translate-x-0.5"
                    )}
                />
            </div>
        </label>
    );
}
