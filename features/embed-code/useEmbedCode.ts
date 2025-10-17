import { useAppStore } from '../../store';
import { CodeGeneratorFactory } from './generatorStrategy';
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

    // 2. Prepare context for code generation
    const parsedMilestones = newConfig.milestones.map(m => parseFloat(m));
    const extension = getExtensionFromDataUri(images[0].src);
    const imageUrls = Array.from({ length: images.length }, (_, i) => `${newConfig.imagePrefix}${i + 1}${extension}`);

    const context = {
      config: newConfig,
      images,
      imageUrls,
      milestones: parsedMilestones,
    };

    // 3. Use strategy pattern to generate appropriate code
    const generator = CodeGeneratorFactory.getGenerator(newConfig.framework);
    const embedTag = generator.generate(context);

    console.log('Generated code:', embedTag);
    setGeneratedEmbedTag(embedTag);
  };

  return { generatedEmbedTag, scriptError, generateCode };
};