import { AdaptiveCard, Container } from '@/components/shared'
import { Card, Skeleton } from '@/components/ui'
import IconButton from '@/components/ui/IconButton'
import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import VideoPlayer from "../../../components/ui/VideoPlayer/index";
import Hls from 'hls.js';

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

const ThemeDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const data = location?.state;
    const [imageLoaders, setImageLoaders] = useState<{ [key: string]: boolean }>({});

    const handlePreviousPage = () => {
        navigate("/admin/theme");
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

        if (data?.image) loaders.theme = true;

        setImageLoaders(loaders);
    }, [data]);

    return (
        <Container>
            <AdaptiveCard className=''>
                {/* {loader ? (
                    <div className='h-[70vh]'>
                        <Loading loading={loader} />
                    </div>
                ) : (
                    <> */}
                <div className='flex items-center gap-3 cursor-pointer' onClick={handlePreviousPage}>
                    <IconButton />
                    <h3>Theme Details</h3>
                </div>
                <div className='mt-5'>
                    {/* <p className='font-bold'>Theme Name</p> */}
                    <p className="font-bold text-gray-900 dark:text-white text-lg">{data?.name || "-"}</p>
                    <div className='mt-2 '>
                        {/* <audio controls src={data?.audio} className='max-w-[220px] sm:max-w-96 w-full'>
                            Your browser does not support the audio element.
                        </audio> */}
                        <AudioPlayer src={data?.audio} />
                    </div>
                </div>
                <div className="grid grid-cols-12 gap-5 mt-5">
                    <Card className="2xl:col-span-4 md:col-span-6 col-span-12 dark:bg-[#573a8c] dark:border-[#6d51a6]">
                        <p className='font-semibold mb-3 text-gray-900 dark:text-white text-base'>Theme Image</p>
                        {/* <img src={data?.image} alt='...' className='h-[350px] sm:h-[500px] md:max-w-[442px] w-full rounded-md object-cover' /> */}
                        <div className="h-[350px] sm:h-[500px] md:max-w-[442px]  relative">
                            {imageLoaders.theme && (
                                <Skeleton className="w-full h-full rounded absolute top-0 left-0 z-10 " />
                            )}
                            {data?.image ? (
                                <img
                                    src={data?.image}
                                    alt="theme"
                                    className={`object-cover w-full h-full rounded ${imageLoaders.theme ? 'invisible' : ''} `}
                                    onLoad={() => handleImageLoad('theme')}
                                    onError={() => handleImageLoad('theme')}
                                    ref={(img) => {
                                        if (img && img.complete && imageLoaders.theme) {
                                            handleImageLoad('theme');
                                        }
                                    }}
                                />
                            ) : (
                                <img src={data?.image} className='w-full h-full' />
                            )}
                        </div>
                    </Card>
                    <Card className='2xl:col-span-4 md:col-span-6 col-span-12 dark:bg-[#573a8c] dark:border-[#6d51a6]'>
                        <p className='font-semibold mb-3 text-gray-900 dark:text-white text-base'>Theme Video</p>
                        <div className='h-[350px] sm:h-[500px] md:max-w-[442px] w-full'>
                            <VideoPlayer
                                videoUrl={data?.video}
                            // poster={data?.thumnail}
                            />
                        </div>
                    </Card>
                    <Card className="2xl:col-span-4 col-span-12 dark:bg-[#573a8c] dark:border-[#6d51a6]">
                        <p className="font-semibold mb-3 text-gray-900 dark:text-white text-base">Theme Colors</p>
                        <div className="flex flex-col gap-4 text-gray-700 dark:text-gray-200 font-medium">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg border border-black/10 dark:border-white/25 shadow-sm shrink-0" style={{ backgroundColor: flutterHexToCssHex(data?.themeTopColor) }}></div>
                                <span>Top Color</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg border border-black/10 dark:border-white/25 shadow-sm shrink-0" style={{ backgroundColor: flutterHexToCssHex(data?.themeBottomColor) }}></div>
                                <span>Bottom Color</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg border border-black/10 dark:border-white/25 shadow-sm shrink-0" style={{ backgroundColor: flutterHexToCssHex(data?.gradientColor) }}></div>
                                <span>Gradient Color</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg border border-black/10 dark:border-white/25 shadow-sm shrink-0" style={{ backgroundColor: flutterHexToCssHex(data?.themeImageBGColor) }}></div>
                                <span>Theme Image BG Color</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-lg border border-black/10 dark:border-white/25 shadow-sm shrink-0" style={{ backgroundColor: flutterHexToCssHex(data?.themeTaskbarColor) }}></div>
                                <span>Bottombar Menu Color</span>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* </>
                )} */}
            </AdaptiveCard>
        </Container>
    )
}

export default ThemeDetails
