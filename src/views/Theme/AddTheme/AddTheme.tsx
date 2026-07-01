import { AdaptiveCard, Container } from '@/components/shared'
import { Button, Card, Checkbox, Form, FormItem, Input, Notification, toast, Upload } from '@/components/ui'
import IconButton from '@/components/ui/IconButton'
import { addthemes, edittheme } from '@/Service/ApiService'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { BiCloudUpload } from 'react-icons/bi'
import { MdOutlineVideoLibrary } from 'react-icons/md'
import { TbCircleXFilled, TbLibraryPhoto } from 'react-icons/tb'
import { useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import VideoPlayer from "../../../components/ui/VideoPlayer/index";

type FormSchema = {
  name: string
  Theme_music: string | File;
  Theme_video: string | File;
  Theme_image: string | File;
  themeTopColor: string;
  themeBottomColor: string;
  gradientColor: string;
  themeTaskbarColor: string;
  themeImageBGColor: string;
  isPremium?: boolean;
  themetoppercent_1: number | string;
  themetoppercent_2: number | string;
  themetoppercent_3: number | string;
};

const validationSchema: any = z.object({
  name: z.string().min(1, { message: 'Category Required' }),
  Theme_music: z.union([
    z.instanceof(File).refine(file => file.size > 0, { message: 'Uploaded file is empty' }),
    z.string().url({ message: 'Theme audio is invalid' })
  ]),
  Theme_video: z.union([
    z.instanceof(File).refine(file => file.size > 0, { message: 'Uploaded file is empty' }),
    z.string().url({ message: 'Theme video is invalid' })
  ]),
  Theme_image: z.union([
    z.instanceof(File).refine(file => file.size > 0, { message: 'Uploaded file is empty' }),
    z.string().min(1, { message: 'Theme image is required' })
  ]),
  themeTopColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, { message: 'Enter a valid hex color' }),
  themeBottomColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, { message: 'Enter a valid hex color' }),
  gradientColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, { message: 'Enter a valid hex color' }),
  themeTaskbarColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, { message: 'Enter a valid hex color' }),
  themeImageBGColor: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, { message: 'Enter a valid hex color' }),
  isPremium: z.boolean(),
  themetoppercent_1: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val.trim() === "") return undefined;
      const num = Number(val);
      return isNaN(num) ? val : num;
    }
    return val;
  },
    z.number({
      required_error: "Value is required",
      invalid_type_error: "Only numeric values are allowed",
    })
      .int({ message: "Only whole numbers are allowed" })
      .min(0, { message: "Minimum value is 0" })
      .max(100, { message: "Maximum value is 100" })
  ),
  themetoppercent_2: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val.trim() === "") return undefined;
      const num = Number(val);
      return isNaN(num) ? val : num;
    }
    return val;
  },
    z.number({
      required_error: "Value is required",
      invalid_type_error: "Only numeric values are allowed",
    })
      .int({ message: "Only whole numbers are allowed" })
      .min(0, { message: "Minimum value is 0" })
      .max(100, { message: "Maximum value is 100" })
  ),
  themetoppercent_3: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val.trim() === "") return undefined;
      const num = Number(val);
      return isNaN(num) ? val : num;
    }
    return val;
  },
    z.number({
      required_error: "Value is required",
      invalid_type_error: "Only numeric values are allowed.",
    })
      .int({ message: "Only whole numbers are allowed." })
      .min(0, { message: "Minimum value is 0" })
      .max(100, { message: "Maximum value is 100" })
  ),
});

const AddTheme = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const data = location?.state;
  const [formValues, setFormValues] = useState<any>({});
  const [imagePreview, setImagePreview] = useState<any>(null);
  const [videoPreview, setVideoPreview] = useState<any>(null);
  const [pending, setPending] = useState(false);

  const handleCancel = () => {
    reset();
    navigate("/admin/theme");
    setPending(false);
  };

  useEffect(() => {
    setFormValues(data);
    setValue("name", data?.name || '');
    if (data?.image) {
      setValue("Theme_image", data?.image);
      setImagePreview(data.image);
    }

    if (data?.video) {
      setValue("Theme_video", data?.video);
      setVideoPreview(data.video);
    }

    if (data?.audio) {
      setValue("Theme_music", data?.audio);
    }

    const argbToHex = (argb: string) => {
      return `#${argb?.replace('0xff', '')}`;
    };

    setValue("themeTopColor", data?.themeTopColor ? argbToHex(data.themeTopColor) : '');
    setValue("themeBottomColor", data?.themeBottomColor ? argbToHex(data.themeBottomColor) : '');
    setValue("gradientColor", data?.gradientColor ? argbToHex(data.gradientColor) : '');
    setValue("themeImageBGColor", data?.themeImageBGColor ? argbToHex(data.themeImageBGColor) : '');
    setValue("themeTaskbarColor", data?.themeTaskbarColor ? argbToHex(data.themeTaskbarColor) : '');
    setValue("themetoppercent_1", data?.gradientColorOne);
    setValue("themetoppercent_2", data?.gradientColorTwo);
    setValue("themetoppercent_3", data?.gradientColorThree);
    setValue("isPremium", data?.isPremium);

  }, [data]);

  const {
    handleSubmit,
    reset,
    formState: { errors },
    control,
    setValue,
    trigger
  } = useForm<FormSchema>({
    defaultValues: {
      name: formValues?.name || '',
      Theme_music: formValues?.audio || '',
      Theme_image: formValues?.image || '',
      Theme_video: formValues?.video || '',
      themeTopColor: formValues?.themeTopColor || '',
      themeBottomColor: formValues?.themeBottomColor || '',
      gradientColor: formValues?.gradientColor || '',
      themeTaskbarColor: formValues?.themeTaskbarColor || '',
      themeImageBGColor: formValues?.themeImageBGColor || '',
      isPremium: data?.isPremium,
      themetoppercent_1: formValues?.themetoppercent_1 || '',
      themetoppercent_2: formValues?.themetoppercent_2 || '',
      themetoppercent_3: formValues?.themetoppercent_3 || '',
    },
    resolver: zodResolver(validationSchema),
  });

  const onSubmit = (values: FormSchema) => {
    setPending(true);

    const formData: any = new FormData();

    const hexToArgb = (hex: string) => {
      return `0xff${hex.replace('#', '').toUpperCase()}`;
    };

    if (data) {
      formData.append("theme_id", data?.id);
      formData.append("name", values?.name);
      if (values.Theme_music instanceof File) {
        formData.append("Theme_music", values.Theme_music);
      }

      if (values.Theme_video instanceof File) {
        formData.append("Theme_video", values.Theme_video);
      }

      if (values.Theme_image instanceof File) {
        formData.append("Theme_image", values.Theme_image);
      }

      formData.append("isPremium", values?.isPremium);

      formData.append("themeTopColor", hexToArgb(values?.themeTopColor));
      formData.append("themeBottomColor", hexToArgb(values?.themeBottomColor));
      formData.append("gradientColor", hexToArgb(values?.gradientColor));
      formData.append("themeImageBGColor", hexToArgb(values?.themeImageBGColor));
      formData.append("themeTaskbarColor", hexToArgb(values?.themeTaskbarColor));
      formData.append("gradientColorOne", values?.themetoppercent_1);
      formData.append("gradientColorTwo", values?.themetoppercent_2);
      formData.append("gradientColorThree", values?.themetoppercent_3);

      edittheme(formData)
        .then((res) => {
          // console.log(res, "res");
          if (res?.status === 201) {
            const successmsg = res?.data?.message;
            toast.push(
              <Notification type='success'>{successmsg || "Theme update Sucessfully"}</Notification>,
              { placement: "top-end" }
            );
            navigate("/admin/theme");
          }
          setPending(false);
          reset();
        }).catch((err) => {
          // console.log(err, "error");
          const errormsg = err?.response?.data?.message;
          toast.push(
            <Notification type='danger'>{errormsg || "Theme not update "}</Notification>,
            { placement: "top-end" }
          );
          setPending(false);
        })
    } else {

      formData.append("name", values?.name);
      formData.append("Theme_music", values?.Theme_music);
      formData.append("Theme_video", values?.Theme_video);
      formData.append("Theme_image", values?.Theme_image);
      formData.append("isPremium", values?.isPremium);
      formData.append("themeTopColor", hexToArgb(values?.themeTopColor));
      formData.append("themeBottomColor", hexToArgb(values?.themeBottomColor));
      formData.append("gradientColor", hexToArgb(values?.gradientColor));
      formData.append("themeImageBGColor", hexToArgb(values?.themeImageBGColor));
      formData.append("themeTaskbarColor", hexToArgb(values?.themeTaskbarColor));
      formData.append("gradientColorOne", values?.themetoppercent_1);
      formData.append("gradientColorTwo", values?.themetoppercent_2);
      formData.append("gradientColorThree", values?.themetoppercent_3);

      addthemes(formData)
        .then((res) => {
          // console.log(res, "res");
          if (res?.status === 201) {
            const successmsg = res?.data?.message;
            toast.push(
              <Notification type='success'>{successmsg || "Theme add Sucessfully"}</Notification>,
              { placement: "top-end" }
            );
            navigate("/admin/theme");
          }
          setPending(false);
          reset();
        }).catch((err) => {
          // console.log(err, "error");
          const errormsg = err?.response?.data?.message;
          toast.push(
            <Notification type='danger'>{errormsg || "Theme not add "}</Notification>,
            { placement: "top-end" }
          );
          setPending(false);
        })
    }
  };

  const handleImg = (e: any) => {
    const files = e;

    if (files && files.length > 0) {
      const file = files[0];

      // const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      // if (validImageTypes.includes(file.type)) {
      if (file.type.startsWith("image/")) {
        const newImageUrl = URL.createObjectURL(file);
        setImagePreview(newImageUrl);
        setValue("Theme_image", file);
        trigger("Theme_image");
      } else {
        toast.push(
          <Notification type="danger">
            Invalid file type! Please upload an image (JPEG, PNG, GIF).
          </Notification>,
          { placement: "top-end" }
        );
      }
    } else {
      console.error("No files selected.");
    }
  };

  const handleVideo = (e: any) => {
    const files = e;

    if (files && files.length > 0) {
      const file = files[0];

      // ✅ Only allow video types
      // const validVideoTypes = ["video/mp4", "video/webm", "video/ogg"];
      // if (validVideoTypes.includes(file.type)) {
      if (file.type.startsWith("video/")) {
        const newVideoUrl = URL.createObjectURL(file);
        setVideoPreview(newVideoUrl); // You'll need to useState for videoPreview
        setValue("Theme_video", file);
        trigger("Theme_video");
      } else {
        toast.push(
          <Notification type="danger">
            Invalid file type! Please upload a video (MP4, WebM, OGG).
          </Notification>,
          { placement: "top-end" }
        );
      }
    } else {
      console.error("No files selected.");
    }
  };

  const removeImg = () => {
    setValue("Theme_image", "");
    setImagePreview(null);
  };

  const removeVideo = () => {
    setValue("Theme_video", "");
    setVideoPreview(null);
  };

  return (
    <Container>
      <AdaptiveCard>
        <div className='flex items-center gap-3 cursor-pointer' >
          <IconButton onClick={handleCancel} />
          <h3>{data ? "Edit" : "Add"} Theme</h3>
        </div>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <div className='grid grid-cols-12 gap-5 mt-4'>
            <Card className='xl:col-span-8 col-span-12'>
              <FormItem
                label="Theme Name"
                invalid={Boolean(errors.name)}
                errorMessage={errors.name?.message}
              >
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) =>
                    <Input
                      type="text"
                      autoComplete="off"
                      placeholder="Enter the theme name"
                      {...field}
                    />
                  }
                />
              </FormItem>
              <FormItem
                label="Theme Audio"
                invalid={Boolean(errors.Theme_music)}
                errorMessage={errors.Theme_music?.message}
              >
                <Controller
                  name="Theme_music"
                  control={control}
                  render={({ field }) => {
                    return (
                      <>
                        <input
                          type="file"
                          accept="audio/*"
                          id="theme_audio_upload"
                          style={{ display: 'none' }}
                          onChange={(e: any) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              field.onChange(file);
                            }
                          }}
                        />
                        <div className="relative">
                          <Input
                            readOnly
                            placeholder="Upload an audio file"
                            value={
                              field.value instanceof File
                                ? field.value.name
                                : typeof field.value === 'string' && field.value.startsWith('http')
                                  ? field.value.split('/').pop()
                                  : ''
                            }
                            onClick={() =>
                              document.getElementById('theme_audio_upload')?.click()
                            }
                            className="cursor-pointer"
                          />
                          <Button
                            type="button"
                            className="absolute right-2.5 top-1 bottom-1 my-auto sm:px-3 px-2 py-0 h-9"
                            onClick={() =>
                              document.getElementById('theme_audio_upload')?.click()
                            }
                            icon={<BiCloudUpload />}
                          >
                            <span className="hidden sm:inline-block">Upload File</span>
                          </Button>
                        </div>
                      </>
                    );
                  }}
                />
              </FormItem>
              <FormItem
                label="Theme Video"
                invalid={Boolean(errors.Theme_video)}
                errorMessage={errors.Theme_video?.message}
              >
                <Upload
                  accept="video/*"
                  draggable
                  className="min-h-[350px]"
                  showList={false}
                  uploadLimit={1}
                  onChange={handleVideo}
                >
                  {videoPreview ? (
                    <div className="flex max-w-84 w-auto h-[250px] object-cover rounded-md">
                      {/* <video
                        className=""
                        src={videoPreview}
                        controls
                      // alt="image preview"
                      /> */}
                      <VideoPlayer
                        videoUrl={videoPreview}
                      />
                      <TbCircleXFilled
                        className="text-red-500 text-lg z-20 -m-2.5"
                        onClick={removeVideo}
                      />
                    </div>
                  ) : (
                    <div className="max-w-full flex flex-col px-4 py-2 justify-center items-center min-h-[130px]">
                      <div className="text-[50px]"><MdOutlineVideoLibrary /></div>
                      <p className="text-center mt-1 text-xs">
                        <span className="text-gray-800 dark:text-white">Drop your Video here, or </span>
                        <span className="text-primary">Click to browse</span>
                      </p>
                    </div>
                  )}
                </Upload>
              </FormItem>
              <div className='grid grid-cols-12 gap-5'>
                <FormItem
                  label="Theme Image BG Color"
                  className='col-span-6'
                  invalid={Boolean(errors.themeImageBGColor)}
                  errorMessage={errors.themeImageBGColor?.message}
                >
                  <Controller
                    name="themeImageBGColor"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-12 h-10 border rounded py-0.5 px-1"
                        />
                        <Input
                          type="text"
                          value={field.value}
                          onChange={e => field.onChange(e.target.value)}
                          placeholder="#000000"
                          className="w-full"
                        />
                      </div>
                    )}
                  />
                </FormItem>
                <FormItem
                  label="Bottombar Menu Color"
                  className='col-span-6'
                  invalid={Boolean(errors.themeTaskbarColor)}
                  errorMessage={errors.themeTaskbarColor?.message}
                >
                  <Controller
                    name="themeTaskbarColor"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="w-12 h-10 border rounded py-0.5 px-1"
                        />
                        <Input
                          type="text"
                          value={field.value}
                          onChange={e => field.onChange(e.target.value)}
                          placeholder="#000000"
                          className="w-full"
                        />
                      </div>
                    )}
                  />
                </FormItem>
              </div>
              <FormItem
                label="Percentage of Top Theme Color (%)"
                className='mb-0'
              />
              <div className='grid grid-cols-3 gap-5'>
                <FormItem
                  label=""
                  invalid={Boolean(errors.themetoppercent_1)}
                  errorMessage={errors.themetoppercent_1?.message}
                >
                  <Controller
                    name="themetoppercent_1"
                    control={control}
                    render={({ field }) =>
                      <Input
                        type="number"
                        // suffix="%"
                        autoComplete="off"
                        placeholder="Enter the percent"
                        {...field}
                      />
                    }
                  />
                </FormItem>
                <FormItem
                  label=""
                  invalid={Boolean(errors.themetoppercent_2)}
                  errorMessage={errors.themetoppercent_2?.message}
                >
                  <Controller
                    name="themetoppercent_2"
                    control={control}
                    render={({ field }) =>
                      <Input
                        type="number"
                        // suffix="%"
                        autoComplete="off"
                        placeholder="Enter the percent"
                        {...field}
                      />
                    }
                  />
                </FormItem>
                <FormItem
                  label=""
                  invalid={Boolean(errors.themetoppercent_3)}
                  errorMessage={errors.themetoppercent_3?.message}
                >
                  <Controller
                    name="themetoppercent_3"
                    control={control}
                    render={({ field }) =>
                      <Input
                        type="number"
                        // suffix="%"
                        autoComplete="off"
                        placeholder="Enter the percent"
                        {...field}
                      />
                    }
                  />
                </FormItem>
              </div>
            </Card>
            <Card className='xl:col-span-4 col-span-12 h-fit'>
              <FormItem
                label="Theme Image"
                invalid={Boolean(errors.Theme_image)}
                errorMessage={errors.Theme_image?.message}
              >
                <Upload
                  accept="image/*"
                  draggable
                  className="min-h-[250px]"
                  showList={false}
                  uploadLimit={1}
                  onChange={handleImg}
                >
                  {imagePreview ? (
                    <div className="flex">
                      <img
                        className="max-w-84 w-auto h-[200px] object-cover rounded-md"
                        src={imagePreview}
                        alt="image preview"
                      />
                      <TbCircleXFilled
                        className="text-red-500 text-lg z-20 -m-2.5"
                        onClick={removeImg}
                      />
                    </div>
                  ) : (
                    <div className="max-w-full flex flex-col px-4 py-2 justify-center items-center min-h-[130px]">
                      <div className="text-[50px]"><TbLibraryPhoto /></div>
                      <p className="text-center mt-1 text-xs">
                        <span className="text-gray-800 dark:text-white">Drop your image here, or </span>
                        <span className="text-primary">Click to browse</span>
                      </p>
                    </div>
                  )}
                </Upload>
              </FormItem>
              <FormItem

                // label="Premium"
                invalid={Boolean(errors.isPremium)}
                errorMessage={errors.isPremium?.message}
              >
                <Controller
                  name="isPremium"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      {...field}
                      checked={!!field.value}
                      onChange={(checked) => field.onChange(checked)}
                    >
                      Theme Premium
                    </Checkbox>
                  )}
                />
              </FormItem>
              <FormItem
                label="Theme Top Color"
                invalid={Boolean(errors.themeTopColor)}
                errorMessage={errors.themeTopColor?.message}
              >
                <Controller
                  name="themeTopColor"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-12 h-10 border rounded py-0.5 px-1"
                      />
                      <Input
                        type="text"
                        value={field.value}
                        onChange={e => field.onChange(e.target.value)}
                        placeholder="#000000"
                        className="w-full"
                      />
                    </div>
                  )}
                />
              </FormItem>
              <FormItem
                label="Theme Bottom Color"
                invalid={Boolean(errors.themeBottomColor)}
                errorMessage={errors.themeBottomColor?.message}
              >
                <Controller
                  name="themeBottomColor"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-12 h-10 border rounded py-0.5 px-1"
                      />
                      <Input
                        type="text"
                        value={field.value}
                        onChange={e => field.onChange(e.target.value)}
                        placeholder="#000000"
                        className="w-full"
                      />
                    </div>
                  )}
                />
              </FormItem>
              <FormItem
                label="Gradient Color"
                invalid={Boolean(errors.gradientColor)}
                errorMessage={errors.gradientColor?.message}
              >
                <Controller
                  name="gradientColor"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="w-12 h-10 border rounded py-0.5 px-1"
                      />
                      <Input
                        type="text"
                        value={field.value}
                        onChange={e => field.onChange(e.target.value)}
                        placeholder="#000000"
                        className="w-full"
                      />
                    </div>
                  )}
                />
              </FormItem>
            </Card>
          </div>
          <div className='flex items-center justify-end w-full mb-0 mt-5'>
            <Button
              type="button"
              disabled={pending}
              className="ltr:mr-2 w-24"
              onClick={() => handleCancel()}
            >
              Cancel
            </Button>
            <Button disabled={pending} loading={pending} variant="solid" type="submit" className={`${pending ? 'w-auto' : 'w-24'}`}>
              {data ? "Save" : "Submit"}
            </Button>
          </div>
        </Form>
      </AdaptiveCard>
    </Container>
  )
}

export default AddTheme
