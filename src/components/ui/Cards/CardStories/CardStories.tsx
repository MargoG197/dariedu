import React from 'react';
import * as Avatar from '@radix-ui/react-avatar';

// Интерфейс пропсов для компонента CardStories
interface CardStoriesProps {
  imageSrc: string;
  title: string;
  onClick: () => void;
}

const CardStories: React.FC<CardStoriesProps> = ({
  imageSrc,
  title,
  onClick,
}) => {
  return (
    <div
      className="relative w-[116px] h-[160px] cursor-pointer overflow-hidden bg-light-gray-white rounded-2xl"
      onClick={onClick}
    >
      {/* Изображение */}
      {/* <img src={imageSrc} alt={title} className="w-full h-full object-cover" /> */}
      <Avatar.Root className='inline-flex items-center justify-center align-middle overflow-hidden w-full h-full rounded-2xl bg-light-gray-2 dark:bg-light-gray-5'>
        {
          imageSrc && (
            <Avatar.Image src={imageSrc} decoding='async'  loading='lazy' className='w-full h-full rounded-2xl object-cover' />
        )}
            <Avatar.Fallback delayMs={1000} className='bg-light-gray-2 dark:bg-light-gray-5 w-full h-full rounded-2xl'>
          </Avatar.Fallback>
        </Avatar.Root>
      {/* Текст поверх картинки */}
      <div className="absolute bottom-4 left-4 font-gerbera-sub2 text-light-gray-white w-[92px] h-[32px] break-words whitespace-normal text-left">
        {title}
      </div>
    </div>
  );
};

export default CardStories;
