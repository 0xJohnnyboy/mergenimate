import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../store';
import { useEmbedCode } from './useEmbedCode';
import { getExtensionFromDataUri } from '../../services/imageProcessor';
import { ClipboardIcon } from '../../components/ui/Icons';

export const EmbedCodeDisplay: React.FC = () => {
    const { generatedEmbedTag } = useEmbedCode();
    const { images, config } = useAppStore(state => ({
        images: state.images,
        config: state.config,
    }));
    const [copyButtonText, setCopyButtonText] = useState('Copy');

    const handleCopy = () => {
        if (generatedEmbedTag) {
            navigator.clipboard.writeText(generatedEmbedTag).then(() => {
                setCopyButtonText('Copied!');
                setTimeout(() => setCopyButtonText('Copy'), 2000);
            });
        }
    };

    const { title, helpText } = useMemo(() => {
        if (images.length === 0) return { title: '', helpText: null };

        const extension = getExtensionFromDataUri(images[0].src);
        const exampleUrl1 = `${config.imagePrefix}1${extension}`;
        const exampleUrl2 = `${config.imagePrefix}2${extension}`;

        const titles = {
            script: 'Paste this single tag into your HTML',
            react: 'Copy this React component',
            vue: 'Copy this Vue component',
            svelte: 'Copy this Svelte component',
        };

        const helps = {
            script: (
                <>
                    Paste this tag into your HTML. Make sure your images are available on your server at the specified paths (e.g., <code className="bg-base-200 text-success px-1.5 py-0.5 rounded text-xs">{exampleUrl1}</code>, <code className="bg-base-200 text-success px-1.5 py-0.5 rounded text-xs">{exampleUrl2}</code>, etc.).
                </>
            ),
            react: (
                <>
                    Save this as a component file (e.g., <code className="bg-base-200 text-success px-1.5 py-0.5 rounded text-xs">Mergenimate.tsx</code>) and import it in your React app. Make sure your images are available at the specified paths.
                </>
            ),
            vue: (
                <>
                    Save this as a component file (e.g., <code className="bg-base-200 text-success px-1.5 py-0.5 rounded text-xs">Mergenimate.vue</code>) and import it in your Vue app. Make sure your images are available at the specified paths.
                </>
            ),
            svelte: (
                <>
                    Save this as a component file (e.g., <code className="bg-base-200 text-success px-1.5 py-0.5 rounded text-xs">Mergenimate.svelte</code>) and import it in your Svelte app. Make sure your images are available at the specified paths.
                </>
            ),
        };

        return {
            title: titles[config.framework] || titles.script,
            helpText: helps[config.framework] || helps.script,
        };
    }, [config.imagePrefix, config.framework, images]);

    if (!generatedEmbedTag) return null;

    const textareaHeight = config.framework === 'script' ? 'h-32' : 'h-96';

    return (
        <div className="mt-6 max-w-3xl mx-auto">
            <div>
                <h4 className="font-semibold mb-2">{title}</h4>
                <p className="text-xs opacity-60 mb-2">{helpText}</p>
                <div className="relative">
                    <button onClick={handleCopy} className="absolute top-2 right-2 px-3 py-1 bg-base-300 hover:bg-primary hover:text-primary-content text-sm font-medium rounded-md flex items-center gap-1.5 transition-colors z-10">
                        <ClipboardIcon /> {copyButtonText}
                    </button>
                    <textarea readOnly value={generatedEmbedTag} className={`w-full ${textareaHeight} bg-base-200 border border-base-300 rounded-md p-4 font-mono text-sm text-success focus:ring-2 focus:ring-primary focus:border-primary resize-y`}></textarea>
                </div>
            </div>
        </div>
    );
};
