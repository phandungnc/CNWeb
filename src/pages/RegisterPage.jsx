import React, { useState } from 'react'
import authImg from '../assets/images/thumbs/auth-img2.png'
import logoImg from '../assets/images/logo/logo.png'

const RegisterPage = () => {
	const [showPassword, setShowPassword] = useState(false)

	const handleTogglePassword = (e) => {
		e.preventDefault()
		setShowPassword((s) => !s)
	}

	const handleSubmit = (e) => {
		e.preventDefault()
	}

	return (
		<>
			{/* ...existing code... */}
			<div className="preloader">
				<div className="loader" />
			</div>

			<div className="side-overlay" />

			<section className="auth d-flex auth--full">
				<div className="auth-left bg-main-50 flex-center p-24">
					<img src={authImg} alt="" />
				</div>
				<div className="auth-right py-40 px-24 flex-center flex-column">
					<div className="auth-right__inner mx-auto w-100">
						<a href="/" className="auth-right__logo">
							<img src={logoImg} alt="" />
						</a>
						<h2 className="mb-8">Đăng ký tài khoản</h2>
						<p className="text-gray-600 text-15 mb-32">Hãy đăng ký tài khoản để bắt đầu học tập</p>

						<form onSubmit={handleSubmit}>
							<div className="mb-24">
								<label htmlFor="username" className="form-label mb-8 h6">Tên đăng nhập</label>
								<div className="position-relative">
									<input type="text" className="form-control py-11 ps-40" id="username" placeholder="Nhập tên đăng nhập" />
									<span className="position-absolute top-50 translate-middle-y ms-16 text-gray-600 d-flex"><i className="ph ph-user" /></span>
								</div>
							</div>
							<div className="mb-24">
								<label htmlFor="email" className="form-label mb-8 h6">Email </label>
								<div className="position-relative">
									<input type="email" className="form-control py-11 ps-40" id="email" placeholder="Nhập địa chỉ email" />
									<span className="position-absolute top-50 translate-middle-y ms-16 text-gray-600 d-flex"><i className="ph ph-envelope" /></span>
								</div>
							</div>
							<div className="mb-24">
								<label htmlFor="current-password" className="form-label mb-8 h6">Mật khẩu</label>
								<div className="position-relative">
									<input
										type={showPassword ? 'text' : 'password'}
										className="form-control py-11 ps-40"
										id="current-password"
										placeholder="Nhập mật khẩu"
										defaultValue=""
									/>
									<button
										type="button"
										onClick={handleTogglePassword}
										aria-label={showPassword ? 'Hide password' : 'Show password'}
										className={`toggle-password position-absolute top-50 inset-inline-end-0 me-16 translate-middle-y ph ${showPassword ? 'ph-eye' : 'ph-eye-slash'}`}
										style={{ border: 'none', background: 'transparent', padding: 0 }}
									/>
									<span className="position-absolute top-50 translate-middle-y ms-16 text-gray-600 d-flex"><i className="ph ph-lock" /></span>
								</div>
								<span className="text-gray-900 text-15 mt-4">Phải có ít nhất 8 ký tự!</span>
							</div>
							<div className="mb-32 flex-between flex-wrap gap-8">
								<div className="form-check mb-0 flex-shrink-0">
									<input className="form-check-input flex-shrink-0 rounded-4" type="checkbox" value="" id="remember" />
									<label className="form-check-label text-15 flex-grow-1" htmlFor="remember">Ghi nhớ tài khoản</label>
								</div>
								{/* <a href="forgot-password.html" className="text-main-600 hover-text-decoration-underline text-15 fw-medium">Forgot Password?</a> */}
							</div>
							<button type="submit" className="btn btn-main rounded-pill w-100">Đăng ký</button>
							<p className="mt-32 text-gray-600 text-center">Đã có tài khoản?{' '}
								<a href="login" className="text-main-600 hover-text-decoration-underline">Đăng nhập ngay</a>
							</p>

						</form>
					</div>
				</div>
			</section>
			{/* ...existing code... */}
		</>
	)
}

export default RegisterPage