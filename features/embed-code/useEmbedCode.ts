import { useAppStore } from '../../store';
import { generateEmbedContent } from './embedScriptTemplate';
import { getExtensionFromDataUri } from '../../services/imageProcessor';
import { AnimationConfigFormData } from '../config-panel/configSchema';

export const useEmbedCode = () => {
  const { images, setConfig, generatedEmbedTag, scriptError, setGeneratedEmbedTag, setScriptError } = useAppStore(state => ({
    images: state.images,
    setConfig: state.setConfig,
    generatedEmbedTag: state.generatedEmbedTag,
    scriptError: state.scriptError,
    setGeneratedEmbedTag: state.setGeneratedEmbedTag,
    setScriptError: state.setScriptError,
  }));

  const generateCode = (data: AnimationConfigFormData) => {
    console.log('generateCode called with:', data);
    setScriptError(null);
    setGeneratedEmbedTag(null);

    // 1. Sanitize form data and update the global store
    const newConfig = {
        ...data,
        milestones: data.milestones.map(m => m.value),
        timeMilestoneInputs: data.timeMilestoneInputs.map(t => t.value),
    };
    console.log('Setting config:', newConfig);
    setConfig(newConfig);

    // 2. Use the sanitized data to generate the embed code
    const parsedMilestones = newConfig.milestones.map(m => parseFloat(m));
    const extension = getExtensionFromDataUri(images[0].src);
    const imageUrls = Array.from({ length: images.length }, (_, i) => `${newConfig.imagePrefix}${i + 1}${extension}`);

    const scriptContent = generateEmbedContent();
    const base64Script = btoa(unescape(encodeURIComponent(scriptContent)));
    const scriptSrc = `data:application/javascript;base64,${base64Script}`;

    const classAttr = newConfig.className.trim() ? ` data-class="${newConfig.className.trim().replace(/"/g, '&quot;')}"` : '';
    const cycleAttr = newConfig.isCycling ? ` data-cycle="true"` : '';
    const embedTag = `<script src="${scriptSrc}" data-duration="${newConfig.duration}" data-milestones='${JSON.stringify(parsedMilestones)}' data-images='${JSON.stringify(imageUrls)}'${classAttr}${cycleAttr}></script>`;

    console.log('Generated embed tag:', embedTag);
    setGeneratedEmbedTag(embedTag);
  };

  return { generatedEmbedTag, scriptError, generateCode };
};