import { AdaptiveCard, Container } from '@/components/shared';
import { Card, Skeleton } from '@/components/ui';
import classNames from '@/utils/classNames';
import { useEffect, useState } from 'react'
import { NumericFormat } from 'react-number-format';
import { useNavigate } from 'react-router-dom';
import { MdBlockFlipped } from 'react-icons/md';
import { PiCirclesThreePlusDuotone, PiMusicNotesSimpleDuotone, PiPaintBrushBroadDuotone, PiStarDuotone, PiUsersDuotone } from 'react-icons/pi';
import { getdashbaord } from '@/Service/ApiService';

const StatisticCard = (props: any) => {
    const {
        title,
        value,
        icon,
        iconClass,
        onClick,
        loading,
    } = props

    const navigate = useNavigate();

    return (
        <button
            className={classNames(
                'p-4 rounded-2xl cursor-pointer ltr:text-left rtl:text-right transition duration-150 outline-hidden col-span-12 md:col-span-6 xl:col-span-4 bg-white dark:bg-gray-900 shadow-md',
            )}
            onClick={loading ? undefined : onClick}
        >
            {loading ? (
                <div className="flex gap-2 2xl:flex-row justify-between items-center relative h-24">
                    <div className="flex flex-col gap-3">
                        <Skeleton width={110} height={12} />
                        <Skeleton width={70} height={26} />
                    </div>
                    <Skeleton variant="circle" width={48} height={48} />
                </div>
            ) : (
            <div className="flex gap-2 2xl:flex-row justify-between items-center relative h-24">
                <div>
                    <div className="mb-4 text-sm font-semibold">{title}</div>
                    <h3 className="mb-1">{value}</h3>
                    {/* <div className="inline-flex items-center flex-wrap gap-1">
                        <GrowShrinkValue
                            className="font-bold"
                            value={growShrink}
                            suffix="%"
                            positiveIcon="+"
                            negativeIcon=""
                        />
                        <span>{compareFrom}</span>
                    </div> */}
                </div>
                <div
                    className={classNames(
                        'flex items-center justify-center min-h-12 min-w-12 max-h-12 max-w-12 text-gray-900 rounded-full text-2xl',
                        iconClass,
                    )}
                >
                    {icon}
                </div>
            </div>
            )}
        </button>
    )
};

const Dashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState<any>({});
    const [loading, setLoading] = useState<boolean>(true);

    const getDashbaordData = () => {
        setLoading(true);
        getdashbaord()
            .then((res) => {
                const data = res?.data?.data;
                setDashboardData(data);
            }).catch(() => {

            }).finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        getDashbaordData();
    }, []);

    const handleNavigation = (route: string, params?: Record<string, any>) => {
        navigate(route);
    };

    return (
        <Container>
            <AdaptiveCard>
                <div className="flex items-center justify-between">
                </div>
                <Card className=''>
                    <h4 className='mb-3'>Users</h4>
                    <div className='grid grid-cols-12 gap-4 rounded-2xl'>
                        <StatisticCard
                            loading={loading}
                            title="Total Users"
                            value={
                                <NumericFormat
                                    displayType="text"
                                    value={dashboardData?.userCount || 0}
                                    thousandSeparator={true}
                                />
                            }
                            iconClass="bg-sky-200"
                            icon={<PiUsersDuotone />}
                            label="totalUsers"
                            onClick={() => handleNavigation('/admin/users')}
                        />
                        <StatisticCard
                            loading={loading}
                            title="Total Users Block"
                            value={
                                <NumericFormat
                                    displayType="text"
                                    value={dashboardData?.block_user || 0}
                                    thousandSeparator={true}
                                />
                            }
                            iconClass="bg-green-200"
                            icon={<MdBlockFlipped />}
                            label="totalUserBlock"
                            // onClick={() => handleNavigation(`/admin/users`)}
                            onClick={() => {
                                const queryParams = new URLSearchParams();
                                queryParams.set('type', 'block');
                                navigate(`/admin/users?${queryParams.toString()}`);
                            }}
                        />
                        <StatisticCard
                            loading={loading}
                            title="Total Users Premium"
                            value={
                                <NumericFormat
                                    displayType="text"
                                    value={dashboardData?.premiumUserCount || 0}
                                    thousandSeparator={true}
                                />
                            }
                            iconClass="bg-yellow-200"
                            icon={<PiStarDuotone />}
                            label="totalUserPremium"
                            onClick={() => handleNavigation(`/admin/users`)}
                        />
                    </div>
                </Card>
                <Card className='mt-7'>
                    <h4 className='mb-3'>Overview</h4>
                    <div className='grid grid-cols-12 gap-4 rounded-2xl'>
                        <StatisticCard
                            loading={loading}
                            title="Total Category"
                            value={
                                <NumericFormat
                                    displayType="text"
                                    value={dashboardData?.categoryCount || 0}
                                    thousandSeparator={true}
                                />
                            }
                            iconClass="bg-orange-200"
                            icon={<PiCirclesThreePlusDuotone />}
                            label="totalcategory"
                            onClick={() => handleNavigation('/admin/category')}
                        />
                        <StatisticCard
                            loading={loading}
                            title="Total Sub Category"
                            value={
                                <NumericFormat
                                    displayType="text"
                                    value={dashboardData?.subCategoryCount || 0}
                                    thousandSeparator={true}
                                />
                            }
                            iconClass="bg-rose-200"
                            icon={<PiCirclesThreePlusDuotone />}
                            label="totalsubcategory"
                            onClick={() => handleNavigation('/admin/subcategory')}
                        />
                        <StatisticCard
                            loading={loading}
                            title="Total Themes"
                            value={
                                <NumericFormat
                                    displayType="text"
                                    value={dashboardData?.theamCount || 0}
                                    thousandSeparator={true}
                                />
                            }
                            iconClass="bg-purple-200"
                            icon={<PiPaintBrushBroadDuotone />}
                            label="totaltheme"
                            onClick={() => handleNavigation('/admin/theme')}
                        />
                        <StatisticCard
                            loading={loading}
                            title="Total Musics"
                            value={
                                <NumericFormat
                                    displayType="text"
                                    value={dashboardData?.musicCount || 0}
                                    thousandSeparator={true}
                                />
                            }
                            iconClass="bg-blue-200"
                            icon={<PiMusicNotesSimpleDuotone />}
                            label="totaltheme"
                            onClick={() => handleNavigation('/admin/music')}
                        />
                    </div>
                </Card>
            </AdaptiveCard>
        </Container>
    )
}

export default Dashboard
