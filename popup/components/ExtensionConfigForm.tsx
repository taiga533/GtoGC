import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { number, z } from "zod"

const extensionConfigFormSchema = z.object({
  syncTermType: z.enum(["0", "7", "30"]).default("0")
})

type ExtensionConfig = z.infer<typeof extensionConfigFormSchema>

type ExtensionConfigFormProps = {
  initialValues: ExtensionConfig
  onSubmit: (data: ExtensionConfig) => void
}

export function ExtensionConfigForm({
  initialValues,
  onSubmit
}: ExtensionConfigFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ExtensionConfig>({
    resolver: zodResolver(extensionConfigFormSchema)
  })
  return (
    <form
      className=" flex flex-wrap gap-4 flex-col"
      onSubmit={handleSubmit(onSubmit)}>
      <div className="flex-grow">
        <label className="label">
          <span className="label-text">予定の同期間隔</span>
        </label>
        <select
          className="select w-full max-w-xs"
          {...register("syncTermType", { required: true })}
          defaultValue={initialValues.syncTermType}>
          <option value="0">今日中</option>
          <option value="7">7日間</option>
          <option value="30">30日間</option>
        </select>
        {errors.syncTermType?.message && <p>{errors.syncTermType?.message}</p>}
      </div>
      <div>
        <button className="btn btn-primary" type="submit">
          保存する
        </button>
      </div>
    </form>
  )
}
