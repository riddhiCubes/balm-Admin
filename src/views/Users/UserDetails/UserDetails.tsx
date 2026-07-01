import { AdaptiveCard, Container } from '@/components/shared'
import Loading from '@/components/shared/Loading'
import { Card } from '@/components/ui';
import IconButton from '@/components/ui/IconButton';
import classNames from '@/utils/classNames';
import React, { useEffect, useState } from 'react';
import { TbClockCheck, TbUsers } from 'react-icons/tb';
import { NumericFormat } from 'react-number-format';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiClock } from "react-icons/fi";
import { getuserdetails } from '@/Service/ApiService';
import moment from "moment";

type CustomerInfoFieldProps = {
    title?: string
    value?: string
};

const StatisticCard = (props: any) => {
    const {
        title,
        value,
        icon,
        iconClass,
        onClick,
    } = props

    const navigate = useNavigate();

    return (
        <button
            className={classNames(
                'p-4 rounded-2xl cursor-pointer ltr:text-left rtl:text-right transition duration-150 outline-hidden col-span-12 md:col-span-6 bg-white dark:bg-gray-900 shadow-md',
            )}
            onClick={onClick}
        >
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
        </button>
    )
}
const UserDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [userDetails, setUserDetails] = useState<any>({});
    const [loader, setLoader] = useState(false);

    const getUserDetails = () => {
        setLoader(true);
        const obj = {
            user_id: id
        }

        getuserdetails(obj)
            .then((res) => {
                const data = res?.data?.data;
                setUserDetails(data);
                setLoader(false);
            }).catch((err) => {
                setLoader(false);
            })
    };

    useEffect(() => {
        getUserDetails();
    }, []);

    const handlePreviousPage = () => {
        navigate(-1);
    };

    const CustomerInfoField = ({ title, value }: CustomerInfoFieldProps) => {
        return (
            <div>
                <span className="font-semibold">{title}</span>
                <p className="heading-text font-bold">{value}</p>
            </div>
        )
    };

    const formatTime = (timeString: any) => {
        const duration = moment.duration(timeString);

        if (duration.hours() === 0 && duration.minutes() === 0 && duration.seconds() === 0) {
            return "0 hour";
        }

        if (duration.hours() > 0) {
            return `${duration.hours()} h ${duration.minutes()} min`;
        } else if (duration.minutes() > 0) {
            return `${duration.minutes()} min ${duration.seconds()} sec`;
        } else {
            return `${duration.seconds()} sec`;
        }
    };

    return (
        <Container>
            <AdaptiveCard className=''>
                <div className='flex items-center gap-3 cursor-pointer' onClick={handlePreviousPage}>
                    <IconButton />
                    <h3>User Details</h3>
                </div>
                {loader ? (
                    <div className='h-[70vh]'>
                        <Loading loading={loader} />
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-12 gap-5 mt-5">
                            <div className="2xl:col-span-6 col-span-12">
                                <Card className="w-full h-full">
                                    <div className="">
                                        <div className="flex flex-col items-start gap-4 ">
                                            <div className=''>
                                                <p className='font-bold'>Full Name</p>
                                                <h5 className="font-bold">{userDetails?.name}</h5>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-y-7 gap-x-4 mt-5">
                                            <CustomerInfoField title="Email" value={userDetails?.email || "-"} />
                                        </div>
                                        <div className='grid grid-cols-12 md:gap-5 gap-y-5 mt-5'>
                                            <StatisticCard
                                                title="Completed Session"
                                                value={
                                                    <NumericFormat
                                                        displayType="text"
                                                        value={userDetails?.session || 0}
                                                        thousandSeparator={true}
                                                    />
                                                }
                                                iconClass="bg-sky-200"
                                                icon={<TbClockCheck />}
                                                label="completedsession"
                                            />
                                            <StatisticCard
                                                title="Completed Hours"
                                                value={formatTime(userDetails?.hours)}
                                                iconClass="bg-sky-200"
                                                icon={<FiClock />}
                                                label="completedhours"
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {userDetails?.transaction?.length > 0 && (
                                <Card className="2xl:col-span-6 col-span-12 w-full h-full">
                                    <div className="h-full">
                                        <h5>Subscription Details:</h5>

                                        {(() => {
                                            const plan = userDetails.transaction[0];
                                            return (
                                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                                    <CustomerInfoField title="Subscription Name" value={plan?.subscription_plan || "-"} />
                                                    <CustomerInfoField title="Subscription Price" value={`$${plan?.trans_amount || "-"}`} />
                                                    <CustomerInfoField
                                                        title="Start Date"
                                                        value={plan?.start_date ? moment(plan.start_date).format("DD MMM, YYYY") : "-"}
                                                    />
                                                    <CustomerInfoField
                                                        title="End Date"
                                                        value={plan?.end_date ? moment(plan.end_date).format("DD MMM, YYYY") : "-"}
                                                    />

                                                    <div>
                                                        <span className="font-semibold">Subscription Status</span>
                                                        <div className="mt-3">
                                                            {plan?.is_expire ? (
                                                                <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-md text-sm font-semibold w-20 flex items-center justify-center">
                                                                    Expired
                                                                </span>
                                                            ) : (
                                                                <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-md text-sm font-semibold w-20 flex items-center justify-center">
                                                                    Active
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </Card>
                            )}
                        </div>
                    </>
                )}
            </AdaptiveCard>
        </Container>
    )
}

export default UserDetails
