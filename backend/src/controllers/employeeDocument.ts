// import { Request, Response } from "express";
// import { pool } from '../db';

// export const uploadEmployeeDocument = async (req: Request, res: Response) => {
//   try {
//     const { employee_id, document_type_id, uploaded_by_user_id, uploaded_by_name } = req.body;
//     const file = req.file as Express.Multer.File;

//     if (!file) {
//       return res.status(400).json({ error: "File is required" });
//     }

//     // File URL returned by Cloudinary
//     const fileUrl = (file as any).path; // Cloudinary returns path property
//     const fileType = (file as any).format || file.mimetype.split("/")[1];

//     const result = await pool.query(
//       `
//       UPDATE employee_documents
//       SET file_url = $1,
//           file_type = $2,
//           uploaded_by_user_id = $3,
//           uploaded_by_name = $4,
//           uploaded_at = NOW(),
//           updated_at = NOW()
//       WHERE employee_id = $5 AND document_type_id = $6
//       RETURNING *;
//       `,
//       [fileUrl, fileType, uploaded_by_user_id, uploaded_by_name, employee_id, document_type_id]
//     );

//     if (result.rowCount === 0) {
//       return res.status(404).json({ error: "Document record not found for this employee." });
//     }

//     res.status(200).json({
//       message: "Document uploaded successfully.",
//       document: result.rows[0],
//     });
//   } catch (error) {
//     console.error("[uploadEmployeeDocument]", error);
//     res.status(500).json({ error: "Failed to upload document." });
//   }
// };
import { Request, Response } from "express";
import { pool } from "../db";

export const uploadEmployeeDocument = async (req: Request, res: Response) => {
  try {
    const { employee_id, document_type_id, uploaded_by_user_id, uploaded_by_name } = req.body;
    const file = req.file as Express.Multer.File;

    if (!file) return res.status(400).json({ error: "File is required" });

    const fileUrl = (file as any).path; // Cloudinary returns 'path'
    const fileType = (file as any).format || file.mimetype.split("/")[1];

    const result = await pool.query(
      `
      UPDATE employee_documents
      SET file_url = $1,
          file_type = $2,
          uploaded_by_user_id = $3,
          uploaded_by_name = $4,
          uploaded_at = NOW(),
          updated_at = NOW()
      WHERE employee_id = $5 AND document_type_id = $6
      RETURNING *;
      `,
      [fileUrl, fileType, uploaded_by_user_id, uploaded_by_name, employee_id, document_type_id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Document record not found for this employee." });

    res.status(200).json({
      message: "Document uploaded successfully.",
      document: result.rows[0],
    });
  } catch (error) {
    console.error("[uploadEmployeeDocument]", error);
    res.status(500).json({ error: "Failed to upload document." });
  }
};

export const getAllEmployeeDocuments = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT ed.*, e.name AS employee_name, dt.name AS document_type_name
      FROM employee_documents ed
      LEFT JOIN employees e ON e.id = ed.employee_id
      LEFT JOIN document_types dt ON dt.id = ed.document_type_id
      ORDER BY ed.created_at DESC;
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("[getAllEmployeeDocuments]", error);
    res.status(500).json({ error: "Failed to retrieve employee documents." });
  }
};

export const getEmployeeDocumentsByEmployeeId = async (req: Request, res: Response) => {
  try {
    const { employee_id } = req.params;
    const result = await pool.query(
      `
      SELECT ed.*, dt.name AS document_type_name
      FROM employee_documents ed
      LEFT JOIN document_types dt ON dt.id = ed.document_type_id
      WHERE ed.employee_id = $1
      ORDER BY ed.created_at DESC;
      `,
      [employee_id]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("[getEmployeeDocumentsByEmployeeId]", error);
    res.status(500).json({ error: "Failed to retrieve documents for this employee." });
  }
};

export const getSingleEmployeeDocument = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT ed.*, e.name AS employee_name, dt.name AS document_type_name
      FROM employee_documents ed
      LEFT JOIN employees e ON e.id = ed.employee_id
      LEFT JOIN document_types dt ON dt.id = ed.document_type_id
      WHERE ed.id = $1
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Employee document not found." });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("[getSingleEmployeeDocument]", error);
    res.status(500).json({ error: "Failed to fetch employee document." });
  }
};

export const updateEmployeeDocument = async (req: Request, res: Response) => {
  try {
    const { document_id } = req.params;
    const { document_name, is_verified, verified_by } = req.body;

    const result = await pool.query(
      `
      UPDATE employee_documents
      SET document_name = COALESCE($1, document_name),
          is_verified = COALESCE($2, is_verified),
          verified_by = COALESCE($3, verified_by),
          verified_at = CASE WHEN $2 = TRUE THEN NOW() ELSE verified_at END,
          updated_at = NOW()
      WHERE id = $4
      RETURNING *;
      `,
      [document_name, is_verified, verified_by, document_id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Document not found." });

    res.status(200).json({
      message: "Document updated successfully.",
      document: result.rows[0],
    });
  } catch (error) {
    console.error("[updateEmployeeDocument]", error);
    res.status(500).json({ error: "Failed to update document." });
  }
};

export const deleteEmployeeDocument = async (req: Request, res: Response) => {
  try {
    const { document_id } = req.params;

    const result = await pool.query(
      `DELETE FROM employee_documents WHERE id = $1 RETURNING *;`,
      [document_id]
    );

    if (result.rowCount === 0)
      return res.status(404).json({ error: "Document not found." });

    res.status(200).json({
      message: "Document deleted successfully.",
      deleted: result.rows[0],
    });
  } catch (error) {
    console.error("[deleteEmployeeDocument]", error);
    res.status(500).json({ error: "Failed to delete document." });
  }
};
