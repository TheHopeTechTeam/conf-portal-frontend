import DeleteForm from "@/components/DataPage/DeleteForm";

interface WorkshopDeleteFormProps {
  onSubmit: (payload: { reason?: string; permanent?: boolean }) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
  isPermanent?: boolean;
}

const WorkshopDeleteForm: React.FC<WorkshopDeleteFormProps> = ({
  onSubmit,
  onCancel,
  submitting,
  isPermanent = false,
}) => {
  return (
    <DeleteForm onSubmit={onSubmit} onCancel={onCancel} submitting={submitting} entityName="工作坊" isPermanent={isPermanent} />
  );
};

export default WorkshopDeleteForm;

