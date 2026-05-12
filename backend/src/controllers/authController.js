const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const Usuario = require('../models/usuario');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const cookieOpts = {
  httpOnly: true,
  secure: false,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

// POST /api/auth/registro
exports.registro = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password)
      return res.status(400).json({ error: 'Faltan campos obligatorios' });

    const existe = await Usuario.findOne({ where: { email } });
    if (existe) return res.status(409).json({ error: 'El email ya está registrado' });

    const hash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, email, password: hash });

    res.cookie('token', signToken(usuario.id), cookieOpts);
    res.status(201).json({
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Faltan campos obligatorios' });

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const ok = await bcrypt.compare(password, usuario.password);
    if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' });

    res.cookie('token', signToken(usuario.id), cookieOpts);
    res.json({
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// GET /api/auth/perfil
exports.perfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: ['id', 'nombre', 'email'],
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

// POST /api/auth/logout
exports.logout = (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
  res.json({ mensaje: 'Sesión cerrada' });
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  // Respuesta genérica siempre para evitar user enumeration
  const respuesta = { mensaje: 'Si el email existe, recibirás un enlace de recuperación.' };
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email requerido' });

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.json(respuesta);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await usuario.update({ resetToken: hash, resetTokenExpires: expires });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Fichas de PNJ" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Recuperación de contraseña — Fichas PNJ D&D',
      html: `
        <div style="font-family:serif;max-width:500px;margin:0 auto;background:#16213e;color:#C9A84C;padding:32px;border-radius:8px;">
          <h2 style="font-family:serif;text-align:center;margin-bottom:16px;">Fichas de PNJ · D&D 5e</h2>
          <p style="color:#e8c97a;">Haz clic en el botón para restablecer tu contraseña.</p>
          <p style="text-align:center;margin:32px 0;">
            <a href="${resetUrl}" style="background:#C9A84C;color:#1a1a2e;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;">
              Restablecer contraseña
            </a>
          </p>
          <p style="color:#C9A84C;opacity:0.6;font-size:12px;">El enlace expira en 1 hora. Si no solicitaste este cambio, ignora este email.</p>
        </div>
      `,
    });

    res.json(respuesta);
  } catch (err) {
    console.error('[forgotPassword]', err.message);
    res.json(respuesta); // no revelar si hubo error de SMTP
  }
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password)
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    if (password.length < 6)
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });

    const hash = crypto.createHash('sha256').update(token).digest('hex');
    const usuario = await Usuario.findOne({
      where: { resetToken: hash, resetTokenExpires: { [Op.gt]: new Date() } },
    });

    if (!usuario)
      return res.status(400).json({ error: 'El enlace no es válido o ha expirado.' });

    const hashed = await bcrypt.hash(password, 10);
    await usuario.update({ password: hashed, resetToken: null, resetTokenExpires: null });

    res.json({ mensaje: 'Contraseña restablecida correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
