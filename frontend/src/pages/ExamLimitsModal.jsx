import React, {
  useEffect,
  useState,
} from "react";

import Modal from "react-modal";
import DatePicker from "react-datepicker";

import {
  X,
  Save,
} from "lucide-react";

import "react-datepicker/dist/react-datepicker.css";

const API = "http://localhost:8000";

Modal.setAppElement("#root");

function ExamLimitsModal({
  isOpen,
  onRequestClose,
}) {
  const [start, setStart] =
    useState(null);

  const [end, setEnd] =
    useState(null);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const loadLimits = async () => {
      setError("");
      setSuccess("");
      setLoading(true);

      try {
        const response = await fetch(
          `${API}/secretariat/exam-limits/json`,
          {
            credentials: "include",
            headers: {
              Accept:
                "application/json",
            },
          }
        );

        if (!response.ok) {
          const data = await response
            .json()
            .catch(() => ({}));

          throw new Error(
            data.detail ||
              "Failed to load exam limits"
          );
        }

        const data =
          await response.json();

        setStart(
          data.start_date
            ? new Date(
                data.start_date
              )
            : null
        );

        setEnd(
          data.end_date
            ? new Date(
                data.end_date
              )
            : null
        );
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadLimits();
  }, [isOpen]);

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!start || !end) {
      setError(
        "Please select both the start and end dates."
      );
      return;
    }

    if (start >= end) {
      setError(
        "The start date must be earlier than the end date."
      );
      return;
    }

    const body =
      new URLSearchParams();

    body.append(
      "start_date",
      start.toISOString()
    );

    body.append(
      "end_date",
      end.toISOString()
    );

    setLoading(true);

    try {
      const response = await fetch(
        `${API}/secretariat/exam-limits`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        }
      );

      const data = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to save exam limits"
        );
      }

      setSuccess(
        data.message ||
          "Exam limits saved successfully."
      );

      setTimeout(() => {
        setSuccess("");
        onRequestClose();
      }, 1200);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      shouldCloseOnOverlayClick={
        !loading
      }
      overlayClassName="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4 relative"
    >
      <button
        type="button"
        onClick={onRequestClose}
        disabled={loading}
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      <h2 className="text-2xl font-bold mb-4">
        Configure Exam Period
      </h2>

      <p className="text-sm text-gray-600 mb-5">
        Define the period during which
        exam dates may be proposed.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3 mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded p-3 mb-4">
          {success}
        </div>
      )}

      {loading &&
      !start &&
      !end ? (
        <p className="text-gray-600">
          Loading exam limits...
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Start Date
            </label>

            <DatePicker
              selected={start}
              onChange={(date) =>
                setStart(date)
              }
              showTimeSelect
              timeIntervals={60}
              dateFormat="dd/MM/yyyy HH:mm"
              placeholderText="Select start date"
              disabled={loading}
              className="w-full border p-2 rounded"
              wrapperClassName="w-full"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">
              End Date
            </label>

            <DatePicker
              selected={end}
              onChange={(date) =>
                setEnd(date)
              }
              showTimeSelect
              timeIntervals={60}
              dateFormat="dd/MM/yyyy HH:mm"
              placeholderText="Select end date"
              disabled={loading}
              minDate={start || undefined}
              className="w-full border p-2 rounded"
              wrapperClassName="w-full"
            />
          </div>

          {start && end && (
            <div className="text-sm text-gray-600 bg-gray-50 rounded p-3">
              <div>
                <strong>
                  Start:
                </strong>{" "}
                {start.toLocaleString(
                  "en-GB",
                  {
                    dateStyle:
                      "medium",
                    timeStyle:
                      "short",
                  }
                )}
              </div>

              <div>
                <strong>
                  End:
                </strong>{" "}
                {end.toLocaleString(
                  "en-GB",
                  {
                    dateStyle:
                      "medium",
                    timeStyle:
                      "short",
                  }
                )}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded"
          >
            <Save
              className="mr-2"
              size={18}
            />

            {loading
              ? "Saving..."
              : "Save Exam Period"}
          </button>
        </form>
      )}
    </Modal>
  );
}

export default ExamLimitsModal;