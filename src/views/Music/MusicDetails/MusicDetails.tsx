import { AdaptiveCard, Container } from '@/components/shared'
import { Card, Skeleton } from '@/components/ui';
import IconButton from '@/components/ui/IconButton';
import Hls from 'hls.js';
import React, { useEffect, useRef, useState } from 'react'
import { PiStarFill } from 'react-icons/pi';
import { useLocation, useNavigate } from 'react-router-dom'

interface AudioPlayerProps {
    src: string;
}

const AudioPlayer = ({ src }: AudioPlayerProps) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!src || !audioRef.current) return;

        const isM3U8 = src.endsWith('.m3u8');

        if (isM3U8 && Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(audioRef.current);

            return () => {
                hls.destroy();
            };
        } else if (isM3U8 && audioRef.current.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari fallback (native HLS support)
            audioRef.current.src = src;
        } else if (!isM3U8) {
            // MP3, WAV, OGG, etc.
            audioRef.current.src = src;
        }
    }, [src]);

    return (
        <audio ref={audioRef} controls className="max-w-[220px] sm:max-w-96 w-full">
            Your browser does not support the audio element.
        </audio>
    );
};

const MusicDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const data = location?.state;
    const [imageLoaders, setImageLoaders] = useState<{ [key: string]: boolean }>({});

    const handlePreviousPage = () => {
        navigate("/admin/music");
    };

    const flutterHexToCssHex = (flutterHex: any) => {
        if (!flutterHex) return "#000000";
        return "#" + flutterHex.replace("0xff", "");
    };

    const handleImageLoad = (key: string) => {
        setImageLoaders(prev => {
            if (!prev[key]) return prev;
            return {
                ...prev,
                [key]: false,
            };
        });
    };

    useEffect(() => {
        const loaders: { [key: string]: boolean } = {};

        if (data?.music_image) loaders.music = true;

        setImageLoaders(loaders);
    }, [data]);

    return (
        <Container>
            <AdaptiveCard>
                <div className='flex items-center gap-3 cursor-pointer' onClick={handlePreviousPage}>
                    <IconButton />
                    <h3>Music Details</h3>
                </div>
                <div className='grid grid-cols-12 gap-5 mt-5'>
                    <Card className='xl:col-span-6 col-span-12'>
                        <div className=''>
                            {/* <p className='font-bold'>Theme Name</p> */}
                            <div className='flex items-center gap-2'>
                                {data?.isPremium && (
                                    <PiStarFill size={22} className='text-yellow-500' />
                                )}
                                <p className="font-bold text-black text-lg">{data?.title || "-"}</p>
                            </div>
                            {/* <span className=" text-sm mt-2" dangerouslySetInnerHTML={{ __html: data?.description || "-" }} /> */}
                            <span className=" text-sm mt-2" >{data?.description || "-"}</span>

                        </div>
                        <div className=" gap-5 mt-5">
                            {/* <img src={data?.music_image} alt='...' className='h-52 sm:h-72 sm:w-96 w-full rounded-md object-cover' /> */}
                            <div className="h-52 sm:h-64 sm:w-96 w-full  relative">
                                {imageLoaders.music && (
                                    <Skeleton className="w-full h-full rounded-md absolute top-0 left-0 z-10 " />
                                )}
                                {data?.music_image ? (
                                    <img
                                        src={data?.music_image}
                                        alt="..."
                                        className={`object-cover rounded-md w-full h-full ${imageLoaders.music ? 'invisible' : ''} `}
                                        onLoad={() => handleImageLoad('music')}
                                        onError={() => handleImageLoad('music')}
                                        ref={(img) => {
                                            if (img && img.complete && imageLoaders.music) {
                                                handleImageLoad('music');
                                            }
                                        }}
                                    />
                                ) : (
                                    <img src={data?.music_image} className='w-full h-full rounded-md' />
                                )}
                            </div>
                        </div>
                    </Card>
                    <Card className='xl:col-span-6 col-span-12'>
                        {data?.with_music && (
                            <div className=''>
                                <p className='mb-2 text-black text-base'>Only Voice</p>
                                <AudioPlayer src={data?.with_music} />
                            </div>
                        )}
                        {data?.only_voice_music && (
                            <div className='mt-4 '>
                                <p className='mb-2 text-black text-base'>With Music</p>
                                <AudioPlayer src={data?.only_voice_music} />
                            </div>
                        )}
                    </Card>
                </div>
            </AdaptiveCard>
        </Container>
    )
}

export default MusicDetails
