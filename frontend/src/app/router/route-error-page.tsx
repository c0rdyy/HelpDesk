import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'

import { Button } from '@/components/ui/button'

export const RouteErrorPage = () => {
  const error = useRouteError()
  const isNotFound = isRouteErrorResponse(error) && error.status === 404

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-lg font-semibold">
        {isNotFound ? 'Страница не найдена' : 'Что-то пошло не так'}
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        {isNotFound
          ? 'По этому адресу ничего нет. Проверьте ссылку или вернитесь на главную.'
          : 'Произошла непредвиденная ошибка при загрузке страницы. Попробуйте вернуться на главную.'}
      </p>
      <Button asChild type="button">
        <Link to="/">На главную</Link>
      </Button>
    </div>
  )
}
