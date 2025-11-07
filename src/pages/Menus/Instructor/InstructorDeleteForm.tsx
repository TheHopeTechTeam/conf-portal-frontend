import DeleteForm from "@/components/DataPage/DeleteForm";

interface InstructorDeleteFormProps {
  onSubmit: (payload: { reason?: string; permanent?: boolean }) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
  isPermanent?: boolean;
}

const InstructorDeleteForm: React.FC<InstructorDeleteFormProps> = ({
  onSubmit,
  onCancel,
  submitting,
  isPermanent = false,
}) => {
  return (
    <DeleteForm onSubmit={onSubmit} onCancel={onCancel} submitting={submitting} entityName="講者" isPermanent={isPermanent} />
  );
};

export default InstructorDeleteForm;

