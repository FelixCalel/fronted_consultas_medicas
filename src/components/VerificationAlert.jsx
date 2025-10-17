import React from "react";

export default function VerificationAlert({ email, onClose }) {
  return (
    <div className="verification-alert-overlay">
      <div className="verification-alert">
        <div className="alert-icon">
          <div className="email-icon">@</div>
        </div>

        <div className="alert-content">
          <h2>¡Confirma tu cuenta!</h2>
          <p>Hemos enviado un correo de verificación a:</p>
          <strong className="email-display">{email}</strong>

          <div className="alert-instructions">
            <p>
              <strong>Pasos a seguir:</strong>
            </p>
            <ol>
              <li>Revisa tu bandeja de entrada</li>
              <li>Busca el correo de verificación</li>
              <li>Haz clic en el enlace de confirmación</li>
              <li>Vuelve aquí para iniciar sesión</li>
            </ol>
          </div>

          <div className="alert-warning">
            <p>
              ! <strong>Importante:</strong> Debes verificar tu cuenta antes de
              poder iniciar sesión.
            </p>
          </div>
        </div>

        <div className="alert-actions">
          <button className="btn btn-primary" onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>

      <style jsx>{`
        .verification-alert-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 1rem;
        }

        .verification-alert {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          text-align: center;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .alert-icon {
          margin-bottom: 1.5rem;
        }

        .email-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .alert-content h2 {
          color: #28a745;
          margin-bottom: 1rem;
          font-size: 1.75rem;
        }

        .email-display {
          color: #007bff;
          font-size: 1.1rem;
          padding: 0.5rem 1rem;
          background: #e3f2fd;
          border-radius: 6px;
          display: inline-block;
          margin: 1rem 0;
        }

        .alert-instructions {
          text-align: left;
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 8px;
          margin: 1.5rem 0;
        }

        .alert-instructions p {
          margin-bottom: 0.5rem;
          color: #495057;
        }

        .alert-instructions ol {
          margin: 0;
          padding-left: 1.2rem;
        }

        .alert-instructions li {
          margin-bottom: 0.5rem;
          color: #6c757d;
        }

        .alert-warning {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 1rem;
          border-radius: 6px;
          margin: 1.5rem 0;
        }

        .alert-warning p {
          margin: 0;
          color: #856404;
        }

        .alert-actions {
          margin-top: 2rem;
        }

        .btn {
          padding: 0.75rem 2rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
