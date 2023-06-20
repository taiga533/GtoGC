import { useEffect } from "react";
import { getExtensionStatus, saveExtensionStatus, type ExtensionStatus } from "./../../api/chromeStorage";
import { ExtensionConfigForm } from "../components/ExtensionConfigForm";
import { Skeleton } from "../components/Skeleton";
import { useAlertContext } from "../hooks/useAlert";
import { useMutation } from "../hooks/useMutation";
import { useQuery } from "../hooks/useQuery";

export function SettingPage() {
  const { data, success, loading } = useQuery(getExtensionStatus);
  const {pushAlert} = useAlertContext();
  const { mutate } = useMutation<ExtensionStatus>(saveExtensionStatus);
  if (loading || data == null) {
    return <Skeleton />;
  }
  return (
    <div className="prose">
      <h2>Garoon同期期間に関する設定</h2>
      <ExtensionConfigForm initialValues={data} onSubmit={(data) => {
        mutate(data);
        pushAlert("設定を保存しました", "alert-success");
      }} />
    </div>
  );
}
