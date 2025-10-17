import { AnimationConfig, ImageInfo, Framework } from '../../types';
import { generateEmbedContent } from './embedScriptTemplate';
import { generateReactComponent, generateVueComponent, generateSvelteComponent } from './componentTemplates';

interface GeneratorContext {
  config: AnimationConfig;
  images: ImageInfo[];
  imageUrls: string[];
  milestones: number[];
}

interface CodeGenerator {
  generate(context: GeneratorContext): string;
}

class ScriptTagGenerator implements CodeGenerator {
  generate(context: GeneratorContext): string {
    const { config, imageUrls, milestones } = context;

    const scriptContent = generateEmbedContent();
    const base64Script = btoa(unescape(encodeURIComponent(scriptContent)));
    const scriptSrc = `data:application/javascript;base64,${base64Script}`;

    const classAttr = config.className.trim()
      ? ` data-class="${config.className.trim().replace(/"/g, '&quot;')}"`
      : '';
    const cycleAttr = config.isCycling ? ` data-cycle="true"` : '';

    return `<script src="${scriptSrc}" data-duration="${config.duration}" data-milestones='${JSON.stringify(milestones)}' data-images='${JSON.stringify(imageUrls)}'${classAttr}${cycleAttr}></script>`;
  }
}

class ReactGenerator implements CodeGenerator {
  generate(context: GeneratorContext): string {
    return generateReactComponent(context);
  }
}

class VueGenerator implements CodeGenerator {
  generate(context: GeneratorContext): string {
    return generateVueComponent(context);
  }
}

class SvelteGenerator implements CodeGenerator {
  generate(context: GeneratorContext): string {
    return generateSvelteComponent(context);
  }
}

class CodeGeneratorFactory {
  private static generators: Record<Framework, CodeGenerator> = {
    script: new ScriptTagGenerator(),
    react: new ReactGenerator(),
    vue: new VueGenerator(),
    svelte: new SvelteGenerator(),
  };

  static getGenerator(framework: Framework): CodeGenerator {
    return this.generators[framework];
  }
}

export { CodeGeneratorFactory };
export type { GeneratorContext };
