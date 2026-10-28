import { useMemo, useState } from "react";
import API from "../services/api";
import { getApiErrorMessage } from "../utils/apiErrors";

export default function useMentorRequestBulkActions(requests = []) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const requestIds = useMemo(
    () => requests.map((request) => request.id || request.request_id).filter(Boolean),
    [requests]
  );

  const toggleSelection = (requestId) => {
    setSelectedIds((previous) =>
      previous.includes(requestId)
        ? previous.filter((id) => id !== requestId)
        : [...previous, requestId]
    );
  };

  const toggleAll = (checked) => {
    setSelectedIds(checked ? requestIds : []);
  };

  const clearSelection = () => setSelectedIds([]);

  const handleAction = async (action) => {
    if (!selectedIds.length) return;
    if (
      action === "reject" &&
      !window.confirm(`Reject ${selectedIds.length} selected requests?`)
    ) {
      return;
    }

    setLoading(true);
    try {
      // Let React render the blocking loader before starting the request.
      await new Promise((resolve) => setTimeout(resolve, 0));
      await API.post("/api/mentor/requests/", {
        request_ids: selectedIds,
        action,
      });
      window.location.reload();
    } catch (err) {
      alert(getApiErrorMessage(err, `Failed to ${action} selected requests.`));
      setLoading(false);
    }
  };

  return {
    selectedIds,
    requestIds,
    loading,
    allSelected: requestIds.length > 0 && selectedIds.length === requestIds.length,
    toggleSelection,
    toggleAll,
    clearSelection,
    handleAction,
  };
}
