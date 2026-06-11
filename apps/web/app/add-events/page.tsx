'use client';

import dynamic from 'next/dynamic';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  AddEventSchema,
  EVENT_CATEGORIES,
  KERALA_DISTRICTS,
  type TAddEventSchema
} from '@innuentha/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@innuentha/ui/components/field';
import { Input } from '@innuentha/ui/components/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@innuentha/ui/components/select';
import { Button } from '@innuentha/ui/components/button';
import { ImagePlus, MapPin, X } from 'lucide-react';
import MapPickerLoader from '@/loaders/map-picker-loader';
import { useMutation } from '@tanstack/react-query';
import { addEventMutationFn } from '@/lib/api';

const TextEditor = dynamic(() => import('@/components/text-editor'), {
  ssr: false
});
const MapPicker = dynamic(() => import('@innuentha/map/map-picker'), {
  ssr: false,
  loading: () => <MapPickerLoader />
});

const AddEventsPage = () => {
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api';

  const form = useForm<TAddEventSchema>({
    resolver: zodResolver(AddEventSchema),
    defaultValues: {
      eventName: '',
      description: '',
      category: undefined,
      district: '',
      place: '',
      latitude: undefined,
      longitude: undefined,
      poster: undefined,
      startDate: '',
      endDate: '',
      organizerName: '',
      contactNumber: '',
      sourceLink: ''
    }
  });

  const { mutate, isPending } = useMutation({
    mutationFn: addEventMutationFn
  });

  const onSubmit = async (data: TAddEventSchema) => {
    const formData = new FormData();
    formData.append('eventName', data.eventName);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('district', data.district);
    formData.append('place', data.place);
    formData.append('latitude', String(data.latitude));
    formData.append('longitude', String(data.longitude));
    formData.append('startDate', data.startDate);
    formData.append('endDate', data.endDate);
    if (data.organizerName)
      formData.append('organizerName', data.organizerName);
    if (data.contactNumber)
      formData.append('contactNumber', data.contactNumber);
    if (data.sourceLink) formData.append('sourceLink', data.sourceLink);
    if (data.poster instanceof File) formData.append('poster', data.poster);

    mutate(formData, {
      onSuccess: () => {
        toast.success('Event submitted!', {
          description:
            'Your event is pending review and will appear on the map once approved.'
        });

        form.reset();
        setPosterPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      },
      onError: ({ message }) => {
        toast.error('Submission failed', { description: message });
      }
    });
  };

  const handlePosterChange = (
    file: File | undefined,
    onChange: (value: File | undefined) => void
  ) => {
    if (file) {
      onChange(file);
      const reader = new FileReader();
      reader.onloadend = () => setPosterPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const clearPoster = (onChange: (value: File | undefined) => void) => {
    onChange(undefined);
    setPosterPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className='min-h-dvh w-full pt-20 md:pt-40'>
      <div className='py-5'>
        <h2 className='text-center font-caveat-brush text-3xl font-semibold text-green-700 underline md:text-5xl'>
          Add Event
        </h2>
      </div>
      <div>
        <form
          id='add-event-form'
          onSubmit={form.handleSubmit(onSubmit)}
          className='p-5 font-inter md:p-10'
        >
          <FieldGroup>
            <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
              {/* Left Column */}
              <div className='space-y-5'>
                {/* Event Name */}
                <Controller
                  name='eventName'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className='font-semibold text-green-700'>
                        Event Name <span className='text-red-500'>*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder='Enter event name'
                        className='h-10'
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Description */}
                <Controller
                  name='description'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className='font-semibold text-green-700'>
                        Description <span className='text-red-500'>*</span>
                      </FieldLabel>
                      <TextEditor
                        value={field.value}
                        onChange={field.onChange}
                        placeholder='Describe the event...'
                        className='min-h-24'
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Category */}
                <Controller
                  name='category'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className='font-inter font-semibold text-green-700'>
                        Category <span className='text-red-500'>*</span>
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className='w-full py-5'>
                          <SelectValue placeholder='Select Category' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {EVENT_CATEGORIES.map((cate) => (
                              <SelectItem
                                key={cate.value}
                                value={cate.value}
                                className='h-10 font-inter'
                              >
                                {cate.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* District */}
                <Controller
                  name='district'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className='font-semibold text-green-700'>
                        District <span className='text-red-500'>*</span>
                      </FieldLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className='w-full py-5'>
                          <SelectValue placeholder='Select District' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {KERALA_DISTRICTS.map((district) => (
                              <SelectItem
                                key={district.value}
                                value={district.value}
                                className='h-10 font-inter'
                              >
                                {district.label}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Place */}
                <Controller
                  name='place'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className='font-semibold text-green-700'>
                        Place <span className='text-red-500'>*</span>
                      </FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder='Enter the venue or location'
                        className='h-10'
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>

              {/* Right Column - starts with location picker */}
              <div className='space-y-5'>
                {/* Poster Upload */}
                <Controller
                  name='poster'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className='font-semibold text-green-700'>
                        Event Poster <span className='text-red-500'>*</span>
                      </FieldLabel>
                      <div
                        className='relative flex min-h-48 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-input transition-colors hover:border-green-500/50'
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {posterPreview ? (
                          <>
                            <img
                              src={posterPreview}
                              alt='Event poster preview'
                              className='h-full max-h-64 w-full rounded-lg object-contain'
                            />
                            <button
                              type='button'
                              onClick={(e) => {
                                e.stopPropagation();
                                clearPoster(field.onChange);
                              }}
                              className='absolute top-2 right-2 rounded-full bg-red-500/80 p-1 text-white transition-colors hover:bg-red-600'
                            >
                              <X className='size-4' />
                            </button>
                          </>
                        ) : (
                          <div className='flex flex-col items-center gap-2 p-6 text-muted-foreground'>
                            <ImagePlus className='size-10 text-green-700/50' />
                            <p className='text-sm'>
                              Click to upload event poster
                            </p>
                            <p className='text-xs text-muted-foreground/60'>
                              Max 5MB • JPG, PNG, WebP
                            </p>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type='file'
                          accept='image/jpeg,image/png,image/webp'
                          className='hidden'
                          onChange={(e) =>
                            handlePosterChange(
                              e.target.files?.[0],
                              field.onChange
                            )
                          }
                        />
                      </div>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Start Date & End Date */}
                <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
                  <Controller
                    name='startDate'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className='font-semibold text-green-700'>
                          Start Date <span className='text-red-500'>*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          type='date'
                          aria-invalid={fieldState.invalid}
                          className='h-10'
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  <Controller
                    name='endDate'
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel className='font-semibold text-green-700'>
                          End Date <span className='text-red-500'>*</span>
                        </FieldLabel>
                        <Input
                          {...field}
                          type='date'
                          aria-invalid={fieldState.invalid}
                          className='h-10'
                        />
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />
                </div>

                {/* Organizer Name */}
                <Controller
                  name='organizerName'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className='font-semibold text-green-700'>
                        Organizer Name
                      </FieldLabel>
                      <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        placeholder='Name of the organizer (optional)'
                        className='h-10'
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Contact Number */}
                <Controller
                  name='contactNumber'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className='font-semibold text-green-700'>
                        Contact Number
                      </FieldLabel>
                      <Input
                        {...field}
                        type='tel'
                        aria-invalid={fieldState.invalid}
                        placeholder='Contact number (optional)'
                        className='h-10'
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                {/* Source Link */}
                <Controller
                  name='sourceLink'
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel className='font-semibold text-green-700'>
                        Source Link
                      </FieldLabel>
                      <Input
                        {...field}
                        type='url'
                        aria-invalid={fieldState.invalid}
                        placeholder='Link to event page (optional)'
                        className='h-10'
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            </div>

            {/* Location Picker - full width below the grid */}
            <Field
              data-invalid={
                form.formState.errors.latitude?.message ||
                form.formState.errors.longitude?.message
                  ? true
                  : false
              }
            >
              <FieldLabel className='font-semibold text-green-700'>
                <MapPin className='inline size-4' /> Pin Event Location{' '}
                <span className='text-red-500'>*</span>
              </FieldLabel>
              <p className='text-sm text-muted-foreground'>
                Click on the map or drag the pin to mark the exact event
                location
              </p>
              <div className='mt-2'>
                <MapPicker
                  lat={form.watch('latitude') ?? 0}
                  lng={form.watch('longitude') ?? 0}
                  apiBaseUrl={apiBaseUrl}
                  onChange={(lat, lng) => {
                    form.setValue('latitude', lat, {
                      shouldValidate: true
                    });
                    form.setValue('longitude', lng, {
                      shouldValidate: true
                    });
                  }}
                />
              </div>
              {form.watch('latitude') && form.watch('longitude') && (
                <p className='text-xs text-muted-foreground'>
                  📍 {form.watch('latitude')?.toFixed(5)},{' '}
                  {form.watch('longitude')?.toFixed(5)}
                </p>
              )}
              {(form.formState.errors.latitude ||
                form.formState.errors.longitude) && (
                <FieldError
                  errors={[
                    form.formState.errors.latitude,
                    form.formState.errors.longitude
                  ]}
                />
              )}
            </Field>

            {/* Submit Button */}
            <div className='mt-8 flex justify-center'>
              <Button
                type='submit'
                size='lg'
                disabled={isPending}
                className='h-12 w-full cursor-pointer bg-green-700 px-12 text-base font-semibold text-white transition-colors hover:bg-green-800 disabled:opacity-60 md:w-auto'
              >
                {isPending ? 'Submitting…' : 'Submit Event'}
              </Button>
            </div>
          </FieldGroup>
        </form>
      </div>
    </div>
  );
};

export default AddEventsPage;
