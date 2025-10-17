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

    const helpText = useMemo(() => {
        if (images.length === 0) return null;
        const extension = getExtensionFromDataUri(images[0].src);
        const exampleUrl1 = `${config.imagePrefix}1${extension}`;
        const exampleUrl2 = `${config.imagePrefix}2${extension}`;
        return (
            <>
                Paste this tag into your HTML. Make sure your images are available on your server at the specified paths (e.g., <code className="bg-gray-900 text-green-400 px-1.5 py-0.5 rounded text-xs">{exampleUrl1}</code>, <code className="bg-gray-900 text-green-400 px-1.5 py-0.5 rounded text-xs">{exampleUrl2}</code>, etc.).
            </>
        );
    }, [config.imagePrefix, images]);

    if (!generatedEmbedTag) return null;

    return (
        <div className="mt-6 max-w-3xl mx-auto">
            <div>
                <h4 className="font-semibold text-gray-300 mb-2">Paste this single tag into your HTML</h4>
                <p className="text-xs text-gray-500 mb-2">{helpText}</p>
                <div className="relative">
                    <button onClick={handleCopy} className="absolute top-2 right-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-sm font-medium rounded-md flex items-center gap-1.5 transition-colors">
                        <ClipboardIcon /> {copyButtonText}
                    </button>
                    <textarea readOnly value={generatedEmbedTag} className="w-full h-32 bg-gray-900 border border-gray-600 rounded-md p-4 font-mono text-sm text-green-300 focus:ring-brand-primary focus:border-brand-primary resize-y"></textarea>
                </div>
            </div>
        </div>
    );
};
