import React from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { CodeIcon } from '../../components/ui/Icons';
import { ConfigForm } from './ConfigForm';
import { useEmbedCode } from '../embed-code/useEmbedCode';
import { EmbedCodeDisplay } from '../embed-code/EmbedCodeDisplay';
import { useAppStore } from '../../store';

interface ConfigDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfigDrawer: React.FC<ConfigDrawerProps> = ({ isOpen, onClose }) => {
    const images = useAppStore(state => state.images);
    const { generatedEmbedTag, scriptError, generateCode } = useEmbedCode();

    const hasImages = images.length > 0;
    
    return (
        <Drawer
            isOpen={isOpen}
            onClose={onClose}
            title={<><CodeIcon className="h-6 w-6" /> Generate Embed Code</>}
        >
            <div className="relative mt-6 flex-1 px-4 sm:px-0">
                {!hasImages ? (
                    <p className="text-center text-gray-400">Please upload at least two images to generate code.</p>
                ) : (
                    <>
                        <p className="text-sm text-gray-400 max-w-2xl mx-auto mb-6">Configure the animation timing and generate a single, self-contained script tag to embed on any website. The animation starts with Image 1 at time 0%.</p>
                        <ConfigForm onGenerate={generateCode} scriptError={scriptError} />
                        {generatedEmbedTag && (
                            <EmbedCodeDisplay />
                        )}
                    </>
                )}
            </div>
        </Drawer>
    );
};
