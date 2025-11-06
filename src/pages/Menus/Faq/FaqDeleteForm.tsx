import DeleteForm from "@/components/DataPage/DeleteForm";

interface FaqDeleteFormProps {
  onSubmit: (payload: { reason?: string; permanent?: boolean }) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
  isPermanent?: boolean;
}

const FaqDeleteForm: React.FC<FaqDeleteFormProps> = ({ onSubmit, onCancel, submitting, isPermanent = false }) => {
  return <DeleteForm onSubmit={onSubmit} onCancel={onCancel} submitting={submitting} entityName="常見問題" isPermanent={isPermanent} />;
};

export default FaqDeleteForm;

